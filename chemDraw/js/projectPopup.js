$(document).ready(function(){
	au.fnSetLoading("on");
	
	$(document).on("contextmenu", e => e.preventDefault());
	$(document).on("dragstart", e => e.preventDefault());
	$(document).on("selectstart", e => e.preventDefault());
	$(document).on("keydown", e => {
		if ((e.ctrlKey || e.metaKey) && e.key === "c") {
			e.preventDefault();
		}
	});
	
	au.fnSetDatepicker(null, "dd.mm.yyyy");
	au.fnEventMenuItemScroll();
	au.hFixedTableResize();
	$(window).on("resize", au.hFixedTableResize);
	
	$("#tbl_patent tbody").rowspan(0);
	
	au.fnSetLoading("off");
});