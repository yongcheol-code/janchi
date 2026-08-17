/**
 * RSVP · 방명록 · 좋아요 · 신랑신부 답글 수집용 Google Apps Script
 * 조용철 & 김유진 청첩장 — 참석 여부, 방명록 메시지, 좋아요를 구글 스프레드시트에 적립하고
 * 모든 방문자가 같은 데이터를 보도록 다시 내려줍니다.
 *
 * ── 설치 순서 ────────────────────────────────────────────────
 * 1. 구글 드라이브에서 새 스프레드시트를 만듭니다. (이름 예: "청첩장 RSVP")
 * 2. 상단 메뉴 [확장 프로그램] → [Apps Script] 를 엽니다.
 * 3. 기본으로 열린 Code.gs 내용을 지우고 이 파일 전체를 붙여넣습니다.
 * 4. 저장 후 [배포] → [새 배포] → 유형 [웹 앱] 선택
 *      - 설명:            RSVP 수집
 *      - 다음 사용자로 실행: 나
 *      - 액세스 권한:      모든 사용자          ← 반드시 이 값이어야 합니다
 * 5. [배포] 를 누르고 권한을 승인한 뒤, 표시되는 웹 앱 URL을 복사합니다.
 *      (https://script.google.com/macros/s/AKfy..../exec 형태)
 * 6. src/config.js 의 CONFIG.rsvpEndpoint 에 그 URL을 붙여넣습니다.
 *
 * ── 신랑신부 답글 비밀코드 설정 (중요) ──────────────────────────
 * "용철·유진 답글"은 코드에 비밀번호를 넣지 않고 서버(Script Properties)에만 저장합니다.
 * 1. Apps Script 편집기 좌측 톱니바퀴 [프로젝트 설정] 클릭
 * 2. 맨 아래 "스크립트 속성" → [스크립트 속성 추가]
 * 3. 속성: COUPLE_PASSCODE  /  값: 원하는 답글 비밀코드(예: 4~8자리)
 * 4. 저장. 이후 화면에서 답글 달 때 이 코드를 입력하면 됩니다.
 *    (이 값을 설정하지 않으면 답글 기능은 항상 "코드가 설정되지 않았습니다" 오류를 반환합니다.)
 *
 * 시트가 없으면 첫 제출 때 헤더와 함께 자동 생성됩니다.
 *
 * ※ 코드를 수정했다면 [배포] → [배포 관리] → 연필 아이콘 → 버전 "새 버전" → [배포]
 *    로 재배포해야 반영됩니다. URL은 그대로 유지됩니다.
 *
 * ⚠️ 기존 버전에서 넘어온 경우, "방명록" 시트의 헤더 행을 아래 GUEST_HEADERS 순서로
 *    맞춰주세요(기존 데이터 행은 그대로 둬도 됩니다. 새 컬럼은 비어있는 채로 시작합니다).
 */

var RSVP_SHEET = 'RSVP';
var RSVP_HEADERS = ['제출시각', '성함', '연락처', '청첩장 파티', '서울 결혼식', '인원'];

var GUEST_SHEET = '방명록';
// id: 클라이언트가 만든 고유값 · post: cover/post2/guest 뱃지 · ownerToken: 이 글을 쓴 브라우저 식별용(비공개)
// 답글/답글시각: 신랑신부가 남긴 답글(비밀코드로 확인)
var GUEST_HEADERS = ['id', '작성시각', 'post', '이름', '메시지', '좋아요', 'ownerToken', '답글', '답글시각'];

var META_SHEET = 'Meta';
var META_HEADERS = ['key', 'value'];
var LIKE_KEYS = ['cover', 'post2', 'guest'];
var LIKE_SEED = { cover: 127, post2: 89, guest: 0 };

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    var when = data.submittedAt ? new Date(data.submittedAt) : new Date();

    if (data.type === 'guestbook') {
      getSheet_(GUEST_SHEET, GUEST_HEADERS).appendRow([
        String(data.id || Utilities.getUuid()),
        when,
        data.post || 'guest',
        data.name || '',
        data.message || '',
        0,
        String(data.ownerToken || ''),
        '',
        ''
      ]);
    } else if (data.type === 'comment_like') {
      bumpCommentLike_(data.id);
    } else if (data.type === 'comment_edit') {
      editComment_(data.id, data.ownerToken, data.message || '');
    } else if (data.type === 'comment_delete') {
      deleteComment_(data.id, data.ownerToken);
    } else if (data.type === 'like') {
      bumpPostLike_(data.key, Number(data.count) || 1);
    } else {
      getSheet_(RSVP_SHEET, RSVP_HEADERS).appendRow([
        when,
        data.name || '',
        normalizePhone_(data.phone),
        data.party || '미정',
        data.wedding || '미정',
        Number(data.headcount) || 1
      ]);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * 방명록 전체 + 좋아요 카운터를 내려준다(기본). ?action=reply 면 신랑신부 답글 등록/수정을 처리한다.
 * callback 파라미터가 있으면 JSONP로, 없으면 순수 JSON으로 응답한다(둘 다 지원해
 * Apps Script의 들쭉날쭉한 CORS 동작을 우회한다). 답글은 비밀코드 확인 결과를 클라이언트가
 * 바로 읽어야 해서 no-cors POST 대신 이 GET+JSONP 경로를 쓴다.
 */
function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.action === 'reply') {
    return respond_(params, handleReply_(params));
  }
  if (params.action === 'verify') {
    return respond_(params, verifyPasscode_(params));
  }

  var guestSheet = getSheet_(GUEST_SHEET, GUEST_HEADERS);
  var rows = guestSheet.getLastRow() > 1
    ? guestSheet.getRange(2, 1, guestSheet.getLastRow() - 1, GUEST_HEADERS.length).getValues()
    : [];
  var comments = rows
    .map(function (r) {
      return {
        id: String(r[0] || ''),
        time: r[1] instanceof Date ? r[1].toISOString() : String(r[1] || ''),
        post: r[2] || 'guest',
        name: r[3] || '',
        text: r[4] || '',
        likes: Number(r[5]) || 0,
        reply: r[7] || '',
        replyAt: r[8] instanceof Date ? r[8].toISOString() : ''
        // ownerToken(r[6])은 응답에 포함하지 않는다 — 본인 확인은 클라이언트가 로컬에 남긴 id 목록으로 한다.
      };
    })
    .filter(function (c) { return c.id; })
    .reverse(); // 최신 글이 먼저 오도록

  var postLikes = {};
  LIKE_KEYS.forEach(function (k) { postLikes[k] = getLikeCounter_(k); });

  return respond_(params, { ok: true, comments: comments, postLikes: postLikes });
}

/** 신랑신부 답글 등록/수정. 비밀코드는 Script Properties에만 있고 클라이언트 코드에는 없다. */
function handleReply_(params) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var expected = PropertiesService.getScriptProperties().getProperty('COUPLE_PASSCODE');
    if (!expected) return { ok: false, error: '답글 비밀코드가 아직 설정되지 않았어요' };
    if (String(params.passcode || '') !== String(expected)) {
      return { ok: false, error: '코드가 올바르지 않아요' };
    }
    var found = findCommentRow_(params.id);
    if (!found) return { ok: false, error: '댓글을 찾을 수 없어요' };
    found.sheet.getRange(found.row, 8).setValue(params.reply || '');
    found.sheet.getRange(found.row, 9).setValue(params.reply ? new Date() : '');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 답글 버튼을 화면에 보이게 할지만 확인하는 용도(실제 데이터 변경 없음).
 * 특정 댓글과 무관하게 코드만 검증해, 신랑신부가 이 기기에서 "인증"을 한 번만 하면 되게 한다.
 */
function verifyPasscode_(params) {
  var expected = PropertiesService.getScriptProperties().getProperty('COUPLE_PASSCODE');
  if (!expected) return { ok: false, error: '답글 비밀코드가 아직 설정되지 않았어요' };
  if (String(params.passcode || '') !== String(expected)) {
    return { ok: false, error: '코드가 올바르지 않아요' };
  }
  return { ok: true };
}

function respond_(params, payload) {
  var cb = params && params.callback;
  var out = cb ? cb + '(' + JSON.stringify(payload) + ')' : JSON.stringify(payload);
  return ContentService.createTextOutput(out).setMimeType(
    cb ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON
  );
}

function bumpPostLike_(key, count) {
  if (LIKE_KEYS.indexOf(key) === -1) return;
  var sheet = getSheet_(META_SHEET, META_HEADERS);
  var row = findMetaRow_(sheet, key);
  var current = row ? Number(sheet.getRange(row, 2).getValue()) || 0 : (LIKE_SEED[key] || 0);
  if (row) sheet.getRange(row, 2).setValue(current + count);
  else sheet.appendRow([key, current + count]);
}

function getLikeCounter_(key) {
  var sheet = getSheet_(META_SHEET, META_HEADERS);
  var row = findMetaRow_(sheet, key);
  if (!row) return LIKE_SEED[key] || 0;
  return Number(sheet.getRange(row, 2).getValue()) || 0;
}

function findMetaRow_(sheet, key) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var keys = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) {
    if (keys[i][0] === key) return i + 2;
  }
  return 0;
}

function bumpCommentLike_(id) {
  var found = findCommentRow_(id);
  if (!found) return;
  var likesCell = found.sheet.getRange(found.row, 6);
  likesCell.setValue((Number(likesCell.getValue()) || 0) + 1);
}

function editComment_(id, ownerToken, message) {
  var found = findCommentRow_(id);
  if (!found) throw new Error('comment not found');
  var storedToken = String(found.sheet.getRange(found.row, 7).getValue() || '');
  if (!storedToken || storedToken !== String(ownerToken || '')) throw new Error('not owner');
  found.sheet.getRange(found.row, 5).setValue(message);
}

function deleteComment_(id, ownerToken) {
  var found = findCommentRow_(id);
  if (!found) return; // 이미 지워졌으면 조용히 통과
  var storedToken = String(found.sheet.getRange(found.row, 7).getValue() || '');
  if (!storedToken || storedToken !== String(ownerToken || '')) throw new Error('not owner');
  found.sheet.deleteRow(found.row);
}

function findCommentRow_(id) {
  if (!id) return null;
  var sheet = getSheet_(GUEST_SHEET, GUEST_HEADERS);
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return { sheet: sheet, row: i + 2 };
  }
  return null;
}

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    if (name === RSVP_SHEET) {
      sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(3, 140);
    } else if (name === GUEST_SHEET) {
      sheet.getRange('B:B').setNumberFormat('yyyy-mm-dd hh:mm');
      sheet.setColumnWidth(5, 420);
      sheet.setColumnWidth(8, 300);
    }
  }
  return sheet;
}

/** 010-1234-5678 형태로 정리하고, 앞자리 0이 잘리지 않게 문자열로 남깁니다. */
function normalizePhone_(raw) {
  if (!raw) return '';
  var d = String(raw).replace(/[^0-9]/g, '');
  if (d.length === 11) return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
  return String(raw);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
