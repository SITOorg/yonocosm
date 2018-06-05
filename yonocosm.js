var YONOCOSM = function(){
	let levels,
		topLevel,
		displayDepth = 5, // quadrant grid size/dept
		setId = "set_og",
		animDelay = 500,
		ssTimeout,
		sets = {};

	let init = function(io) {
		if (io) {
			displayDepth = io["displayDepth"] || displayDepth;
			setId = io["setId"] || setId;
		}

		setPath = "./" + setId + "/";
		topLevel = sets[setId].topLevel;
		levels = getLevelsArray(topLevel);
	};

	let addSet = function(setId, setObject) {
		sets[setId] = setObject;
	};

	let getLevelsArray = function(tl) {
		let la = [];
		for (let i = 0; i < tl; i++){
			la.push(getPieceIdFromInt(i+1));
		}
		return la;
	};

	let makeDisplayMap = function(li) { // give level index
		let qSe = makeBlankQuadrant();
		for (let x = 0; x < displayDepth; x++) {
			for (let y = 0; y < displayDepth; y++) {
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
			qGridExt = displayDepth - 1;

		for (let x = 0; x < displayDepth; x++) {
			for (let y = 0; y < displayDepth; y++) {
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
		for (let x = 0; x < displayDepth; x++) {
			let tempCol = [];
			for (let y = 0; y < displayDepth; y++) {
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
		count = count || levels.length - offset;
		let $holder = $("<div class='levellistholder'>");
		$holder.appendTo($("body"));
		for (let i = 0; i < count; i++) {
			let lvlOffset = offset + i;
			let $section = $("<section>"),
			$headline = $("<h1>"),
			$quadsholder = $("<div class='quadsholder'>");
			$section.prop("id", "lvl_" + lvlOffset);
			$section.addClass("levelviewholder");
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
			ssTimeout = setTimeout(function(){
				$holder.empty();
				generateLevelView($holder, level);
				syncBgImagesToData();
				if (isLast) {
					ssTimeout = setTimeout(function(){
						displaySlideshowOfLevels();
					}, animDelay * 5);
				}
			}, i * animDelay);
		}
	};

	let displayListOfPieces = function(offset, count) {
		let $holder;
		if ($(".piecelistholder").length > 0) {
			$holder = $(".piecelistholder");
		} else {
			$holder = $("<section class='piecelistholder'>").appendTo($("body"));
		}

		let len = levels.length;
		for (let i = 0; i < len; i++) {
			let tpid = levels[i];
			$holder.append($("<img src='" + setPath + tpid + ".png' title='" + tpid + "'>"));
		}
	}

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

	let getPieceIdFromInt = function(i) {
		let intstring = i;
		if (i < 10) {
			intstring = "000" + i;
		} else if (i < 100) {
			intstring = "00" + i;
		} else if (i < 1000) {
			intstring = "0" + i;
		}
		return intstring;
	};

	let clearAllViews = function() {
		clearTimeout(ssTimeout);
		$(".slideshowholder").remove();
		$(".levellistholder").remove();
		$(".piecelistholder").remove();
	}

	return {
		"init": init,
		"displayListOfLevels": displayListOfLevels,
		"displaySlideshowOfLevels": displaySlideshowOfLevels,
		"clearAllViews": clearAllViews,
		"displayListOfPieces": displayListOfPieces,
		"addSet": addSet
	};
}();