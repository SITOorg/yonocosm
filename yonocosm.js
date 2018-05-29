let YONOCOSM = function(){
	var levels = ["0001","0002","0003","0004","0005","0006","0007","0008","0009","0010","0011","0012",
					"0013","0014","0015","0016","0017","0018","0019","0020","0021","0022","0023",
					"0024","0025"], // filename/ids
		qGridSize = 5, // quadrant grid size/dept
		setPath = "./set_og/",
		animDelay = 2000;

	let init = function(io) {
		if (io) {
			levels = io["levels"] || levels;
			qGridSize = io["qGridSize"] || qGridSize;
			setPath = io["setPath"] || setPath;
		}
	};

	let makeDisplayMap = function(li) { // give level index
		let qSe = makeBlankQuadrant();
		for (let x = 0; x < qGridSize; x++) {
			for (let y = 0; y < qGridSize; y++) {
				let idxForCoord = li - (x + y);
				if (idxForCoord >= 0) {
					qSe[x][y] = levels[idxForCoord];
				} else {
					qSe[x][y] = null;
				}
			}
		}
		// now create mirrors of qSe
		let qSw = makeBlankQuadrant(),
		qNw = makeBlankQuadrant(),
		qNe = makeBlankQuadrant(),
		qGridExt = qGridSize - 1;

		for (let x = 0; x < qGridSize; x++) {
			for (let y = 0; y < qGridSize; y++) {
				let qSeXY = qSe[x][y];
				qSw[qGridExt - x][y] = qSeXY;
				qNw[qGridExt - x][qGridExt - y] = qSeXY;
				qNe[x][qGridExt - y] = qSeXY;
			}
		}

		return({"nw":qNw, "ne":qNe, "se":qSe, "sw":qSw});
	};

	let makeBlankQuadrant = function() {
		let tempQuad = [];
		for (let x = 0; x < qGridSize; x++) {
			let tempCol = [];
			for (let y = 0; y < qGridSize; y++) {
				tempCol.push(null);
			}
			tempQuad.push(tempCol);
		}
		return tempQuad;
	};

	let makeQuadrantElement = function(qlabel, qmap) {
		let len = qmap.length,
		$grid = $("<div class='quadgrid'>");
		$grid.addClass(qlabel);
		for (let y = 0; y < len; y++) {
			for (let x = 0; x < len; x++) {
				let $cell = $("<div class='lvl_quad'>");
				if (qmap[x][y]) {
					$cell.data("pid",qmap[x][y]);
				}
				$grid.append($cell);
			}
			$grid.append($("<br>"));
		}
		return $grid;
	};

	let displayListOfLevels = function(offset, count) {
		offset = offset || 0;
		count = count || (levels.length - 1);
		let $holder = $("<div class='levellistholder'>");
		$holder.appendTo($("body"));
		for (let i = 0; i < count; i++) {
			let lvlOffset = offset + i;
			

			let $section = $("<section>"),
			$headline = $("<h1>"),
			$quadsholder = $("<div class='quadsholder'>");
			$section.prop("id", "lvl_" + lvlOffset);
			$headline.text("Level " + lvlOffset);
			$section.append($headline).append($quadsholder);

			generateLevelView($quadsholder, lvlOffset);

			$holder.append($section);
		}
		syncBgImagesToData();
	};

	let displaySlideshowOfLevels = function() {
		let $holder;
		if ($(".slideshowholder").length > 0) {
			$holder = $(".slideshowholder");
		} else {
			$holder = $("<section class='slideshowholder'>").appendTo($("body"));
		}
		for (let i = 0; i < levels.length; i++) {
			let level = i,
				isLast = (i == levels.length - 1);
			setTimeout(function(){
				$holder.empty();
				generateLevelView($holder, level);
				syncBgImagesToData();
				if (isLast) {
					setTimeout(function(){
						displaySlideshowOfLevels();
					}, animDelay * 5);
				}
			}, i * animDelay);
		}
	};

	let generateLevelView = function($holder, level) {
		let quadrantsMap = makeDisplayMap(level);
		let $quadNw = makeQuadrantElement("nw", quadrantsMap.nw),
			$quadNe = makeQuadrantElement("ne", quadrantsMap.ne),
			$quadSw = makeQuadrantElement("sw", quadrantsMap.sw),
			$quadSe = makeQuadrantElement("se", quadrantsMap.se);
		$holder.append($quadNw).append($quadNe).append($("<br>")).append($quadSw).append($quadSe);
	};

	let syncBgImagesToData = function() {
		$(".lvl_quad").each(function(){
			var tpid = $(this).data("pid");
			if (tpid) {
				$(this).css("background-image", "url('" + setPath + tpid + ".png')");
			}
		});
	};

	return {
		"init": init,
		"displayListOfLevels": displayListOfLevels,
		"displaySlideshowOfLevels": displaySlideshowOfLevels
	};
}();