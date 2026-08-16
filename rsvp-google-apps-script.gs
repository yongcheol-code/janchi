/**
 * RSVP · 방명록 수집용 Google Apps Script
 * 조용철 & 김유진 청첩장 — 참석 여부와 방명록 메시지를 구글 스프레드시트에 적립합니다.
 * 시트는 payload.type 에 따라 자동으로 나뉩니다: rsvp → "RSVP", guestbook → "방명록".
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
 * 6. 청첩장 화면 상단 Tweaks 패널 → "RSVP 수집 → rsvpEndpoint" 에 그 URL을 붙여넣습니다.
 *
 * 이후 하객이 [참석 여부 알리기] 를 제출하거나 방명록에 글을 남길 때마다
 * 각각 "RSVP" · "방명록" 시트에 한 줄씩 쌓입니다.
 * 시트가 없으면 첫 제출 때 헤더와 함께 자동 생성됩니다.
 *
 * ※ 코드를 수정했다면 [배포] → [배포 관리] → 연필 아이콘 → 버전 "새 버전" → [배포]
 *    로 재배포해야 반영됩니다. URL은 그대로 유지됩니다.
 */

var RSVP_SHEET = 'RSVP';
var RSVP_HEADERS = ['제출시각', '성함', '연락처', '청첩장 파티', '서울 결혼식', '인원'];
var GUEST_SHEET = '방명록';
var GUEST_HEADERS = ['작성시각', '이름', '메시지'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var when = data.submittedAt ? new Date(data.submittedAt) : new Date();
    if (data.type === 'guestbook') {
      getSheet_(GUEST_SHEET, GUEST_HEADERS).appendRow([when, data.name || '', data.message || '']);
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
  }
}

/** 브라우저로 URL을 직접 열었을 때 배포 상태를 확인하는 용도. */
function doGet() {
  return json_({
    ok: true,
    rsvp: Math.max(0, getSheet_(RSVP_SHEET, RSVP_HEADERS).getLastRow() - 1),
    guestbook: Math.max(0, getSheet_(GUEST_SHEET, GUEST_HEADERS).getLastRow() - 1)
  });
}

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
    sheet.setColumnWidth(1, 150);
    if (name === GUEST_SHEET) sheet.setColumnWidth(3, 420);
    else sheet.setColumnWidth(3, 140);
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
