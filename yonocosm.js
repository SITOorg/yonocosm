var YONOCOSM = function(){
	let levels,
		topLevel,
		displayDepth = 5, // quadrant grid size/dept
		setId = "set_og",
		animDelay = 2000,
		ssTimeout,
		sets = {},
		quadCellClass = "quadcell",
		$displayHolderElement;

	let init = function(io) {
		$displayHolderElement = $("#displayholder");
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

	/** Make a scaffold level view to receive updates
	**/
	let makeLevelViewScaffold = function($holder, depth) {
		depth = depth || displayDepth;
		$holder = $holder || $("<div>").addClass("scaffoldholder").addClass("levelviewholder").data("depth",depth);
		let makeQuadScaffoldElement = function(qlabel) {
			let gridext = depth - 1,
				$element = $("<div>").addClass("quadgrid").addClass(qlabel);
			for (let y = 0; y < depth; y++) {
				for (let x = 0; x < depth; x++) {
					let offset = x + y; // se
					
					if (qlabel == "sw") {
						offset = (gridext - x) + y;
					} else if (qlabel == "nw") {
						offset = (gridext - x) + (gridext - y);
					} else if (qlabel == "ne") {
						offset = x + (gridext - y);
					}

					let $cell = $("<div>").addClass(quadCellClass).addClass("offset_" + offset).data("offset", offset);
					$element.append($cell);
				}
				$element.append($("<br/>"));
			}
			return $element;
		};
		let $qNw = makeQuadScaffoldElement("nw"),
			$qNe = makeQuadScaffoldElement("ne"),
			$qSe = makeQuadScaffoldElement("se"),
			$qSw = makeQuadScaffoldElement("sw");
		$holder.append($qNw).append($qNe).append($("<br/>")).append($qSw).append($qSe);
		return $holder;
	};

	/** Use existing holder to show a new level
		@$holder : created HTML element with all quadrants/cells
		@level : the level to show
	**/
	let updateLevelView = function($holder, level) {
		level = Math.max(0,level);
		// assuming all quadrants are set with offset data()
		let d = $holder.data("depth"),
			prevlevel = $holder.data("level");
		$holder.data("level", level);
		let maxoff = d * 2;
		if (prevlevel > level) {
			// zoom "out"
			let i = 0;
			for (let o = maxoff; o >= 0; o--) {
				setTimeout(function(){
					let $cells = $holder.find(".offset_" + o);
					$cells.data("pid", levels[level - o]).data("plevel", level - o);
					syncBgImagesToData();
				},(50*i));
				i++;
			}
		} else {
			for (let o = 0; o <= maxoff; o++) {
				setTimeout(function(){
					let $cells = $holder.find(".offset_" + o);
					$cells.data("pid", levels[level - o]).data("plevel", level - o);
					syncBgImagesToData();
				},(50*o));
			}
		}
	};

	let generateLevelView = function(level, depth) {
		$holder = makeLevelViewScaffold(null, depth);
		updateLevelView($holder, level);
		return $holder;
	};

	let addUiToLevel = function($holder) {
		// presumes data elements are in place (level)
		let $quadCells = $holder.find("." + quadCellClass);
		$quadCells.off("click").on("click", function(){
			let ddepth = $holder.data("depth"),
				plevel = parseInt($(this).data("plevel"));
			if ($holder.data("level") == plevel) {
				if (plevel != topLevel - 1) {
					updateLevelView($holder, plevel + 1); // expand instead
				}
			} else {
				updateLevelView($holder, plevel);
			}
			syncBgImagesToData();
		});
		$quadCells.hover(function(){ // in
				let thisOffset = $(this).data("offset"),
					$siblings = $holder.find(".offset_" + thisOffset);
				$siblings.addClass("highlightCell");
			}, function() { //out 
				$holder.find(".quadcell").removeClass("highlightCell");
			});
		$quadCells.addClass("clickable");
	};

	let syncBgImagesToData = function() {
		$("." + quadCellClass).each(function(){
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
		$displayHolderElement.empty();
	};

	/* user-facing modes */
	
	let displayListOfLevels = function(offset, count, depth) {
		offset = offset || 1;
		count = count || levels.length - offset;
		depth = depth || displayDepth;
		let $holder = $("<div class='levellistholder'>");
		$holder.appendTo($displayHolderElement);
		for (let i = 0; i < count; i++) {
			let lvlOffset = offset + i;
			let $section = $("<section>"),
				$headline = $("<h1>");
			$section.prop("id", "lvl_" + lvlOffset).addClass("levelviewholder").append($headline);
			$headline.text("Level " + lvlOffset);

			$section.append(generateLevelView(lvlOffset, depth));

			$holder.append($section);
		}
		syncBgImagesToData();
	};

	let displaySlideshowOfLevels = function() {
		let $holder;
		if ($(".slideshowholder").length > 0) {
			$holder = $(".slideshowholder");
		} else {
			$holder = makeLevelViewScaffold(null, displayDepth);
			$holder.addClass("slideshowholder").appendTo($displayHolderElement);
		}
		for (let i = 0; i < levels.length; i++) {
			let level = i,
				isLast = (i == levels.length - 1);
			ssTimeout = setTimeout(function(){
				updateLevelView($holder, level);
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
			$holder = $("<section class='piecelistholder'>").appendTo($displayHolderElement);
		}

		let len = levels.length;
		for (let i = 0; i < len; i++) {
			let tpid = levels[i];
			$holder.append($("<a href='?level=" + tpid + "'><img src='" + setPath + tpid + ".png' title='" + tpid + "'></a>"));
		}
	};

	let displayRecentLevels = function(n) {
		n = n || 5;
		let offset = topLevel - n;
		displayListOfLevels(offset, n, displayDepth);
	};

	let displayInteractiveLevel = function(depth, level) {
		depth = depth || displayDepth;
		level = parseInt(level) || topLevel - 1;
		let $holder = makeLevelViewScaffold(null, depth);
		$holder.addClass("interactivelevel").appendTo($displayHolderElement);
		updateLevelView($holder, level);
		addUiToLevel($holder);
	};

	/* module-type "public" functions */
	return {
		"init": init,
		"displayListOfLevels": displayListOfLevels,
		"displaySlideshowOfLevels": displaySlideshowOfLevels,
		"clearAllViews": clearAllViews,
		"displayListOfPieces": displayListOfPieces,
		"addSet": addSet,
		"displayRecentLevels": displayRecentLevels,
		"displayInteractiveLevel": displayInteractiveLevel
	};
}();