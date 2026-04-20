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

/* li.on 트래킹 + 틸트 */
$(document).on('mousemove', '.mainList li.on', function(e) {
  glassTrack.call(this, e);
  var rect = this.getBoundingClientRect();
  var x = (e.clientX - rect.left) / rect.width;
  var y = (e.clientY - rect.top) / rect.height;
  var tiltX = (0.5 - y) * 4;
  var tiltY = (x - 0.5) * 3;
  this.style.transform = 'translateY(-2px) perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
});
$(document).on('mouseleave', '.mainList li.on', function() {
  this.style.transform = 'translateY(-2px)';
});

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
