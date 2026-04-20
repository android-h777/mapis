/* ── Glass Engine: 마우스 트래킹 (공용) ── */
function glassTrack(e) {
  var rect = this.getBoundingClientRect();
  var x = ((e.clientX - rect.left) / rect.width * 100);
  var yPx = e.clientY - rect.top;
  var angle = Math.atan2(
    e.clientY - (rect.top + rect.height / 2),
    e.clientX - (rect.left + rect.width / 2)
  ) * 180 / Math.PI;
  this.style.setProperty('--olx', x + '%');
  this.style.setProperty('--oly', yPx + 'px');
  this.style.setProperty('--ol-angle', angle + 'deg');
}

/* li.on 트래킹 */
$(document).on('mousemove', '.mainList li.on', glassTrack);

/* hBtn 트래킹 */
$(document).on('mousemove', '.hBtn', glassTrack);

/* modal 트래킹 */
$(document).on('mousemove', '.modal', glassTrack);

/* appleTab 트래킹 — li 위치를 tabBg에 전달 */
$(document).on('mousemove', '.newAppleTab li.on', function(e) {
  var tabBg = $(this).parents('.newAppleTab').find('.tabBg')[0];
  if (!tabBg) return;
  var rect = tabBg.getBoundingClientRect();
  var x = ((e.clientX - rect.left) / rect.width * 100);
  var yPx = e.clientY - rect.top;
  var angle = Math.atan2(
    e.clientY - (rect.top + rect.height / 2),
    e.clientX - (rect.left + rect.width / 2)
  ) * 180 / Math.PI;
  tabBg.style.setProperty('--olx', x + '%');
  tabBg.style.setProperty('--oly', yPx + 'px');
  tabBg.style.setProperty('--ol-angle', angle + 'deg');
});
