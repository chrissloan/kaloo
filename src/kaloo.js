/*-----------------------------------------------------
KALOO CONTROL SUITE v. 1
Utilizes the jQuery Library: http://www.jquery.com

Author: Chris Sloan
Website: http://www.chrissloan.info
License: Open Source MIT Licence
-----------------------------------------------------*/
(function ($){
	
	//---------------------------------
	// TABS CLASS
	// use: $(selectors).kaTab(options)
	//---------------------------------
	$.fn.kaTab = function(options){
		
		var options = $.extend({ // set the default options
			defaultTab: ":first", // the detauld tab
			tabsClass: "tabs", // the tabs
			activeClass: "active", // what the tab should look like active
			hideAll: false, // should all content be hidden
			hasCloser: false, // has an internal link to close the tab
			internalCloserClass: "tab_closer", // internal link closer class
			useAJAX: false, // should other tabs be loaded via AJAX
			jxContentClass: "jx_content", // where the ajax content is to load
			onComplete: function(){}, // any functions needed to be done after completion of AJAX call
			timer: { // if tabs should cycle through like a semi slide show (requires jQuery Timer Plugin)
				isTimed: false,
				interval: null
			}
		}, options ||{});

		// Set the objects
		var element = $(this);
		var elementID = element.attr("id");
		var tabs = element.find("ul:first." + options.tabsClass + " li a");

		var nextIndex = 1; // for timer object
		
		if(location.hash){// Determin if a hash exists in url or not
			tabs.each(function(index){
				if($(this).attr("href") == location.hash){ // does the hash equal any div ID's in the given set?
					options.defaultTab = location.hash;
					return false; // jump out
				}
			});
		}else{
		  if (options.defaultTab != ':first' && options.defaultTab.lastIndexOf("#") == -1)
        options.defaultTab = "#" + options.defaultTab;
    }

		if (options.hasCloser){ // set all the internal closers up
			element.find("." + options.internalCloserClass)
				.click(
					function(event){
						element.children("div." + options.contentClass).hide();
			      tabs.parent().removeClass("active");
						return false;
					});
		}
		
		if(options.hideAll){ // should all the tabs be hidden on page load
			tabs.each(function(index){
				element.find($(this).attr("href")).hide();
			});
		}else{
			if (options.defaultTab == ":first" || options.useAJAX){ // make the first tab active
				tabs.each(function(index){
					index == 0 ? $(this).parent().addClass(options.activeClass) : null; // set the first tab with active class
					if(options.useAJAX){
						if (index == 0){
							$(this).attr("id", "tab_" + tabs.index($(this)));
							showAJAX($(this).attr("jxURL"), options.jxContentClass, tabs.index($(this)));
						}
					}else{
						index != 0 ?	element.find($(this).attr("href")).hide() : null; // hide all other tab content but first
					}
				});
			}else{ // make the tab with hash active and show accordingly
				tabs.each(function(index){
					if(options.defaultTab == $(this).attr("href")){
						$(this).parent().addClass(options.activeClass);
					}else{
						element.find($(this).attr("href")).hide();
					}
				});
			}
		}
		
		if(options.timer.isTimed){ // for cycling through tabs
			
			$(element).everyTime(options.timer.interval, function() {
				hideTabContent();
				tabs.parent().removeClass(options.activeClass);
				$(tabs[nextIndex]).parent().addClass(options.activeClass);
				$(element).find($(tabs[nextIndex]).attr("href")).show();
				nextIndex == tabs.size() - 1 ? nextIndex = 0 : nextIndex++;
			});
		}
		
		// event handler
		tabs.click(
			function(event){
				if(options.useAJAX){
					if($(this).attr("id")){ // if an ID on the link has been set
						showContent(tabs.index($(this))); // show based on DOM already loaded
					}else{ // show based on AJAX call
						$(this).attr("id", "tab_" + tabs.index($(this)));
						showAJAX($(this).attr("jxURL"), options.jxContentClass, tabs.index($(this)));
					}
				}else{
					var theDiv = $(this).attr("href"); // grab the url for corresponding div
					tabs.each(function(index){
						element.find($(this).attr("href")).hide();
					});
					element.find(theDiv).show();
				}
			
				tabs.parent().removeClass(options.activeClass);
				$(this).parent().addClass(options.activeClass);
				return false; // stop the page jump
			}
		);
		
		function showContent(tab_index){ // For AJAX loaded content already in the DOM
			$("."+ elementID + "_loaded").each(function(){
				$(this).hide();
			});
			$("."+ elementID + "_content_" + tab_index).show();
		}
		
		function showAJAX(url, content, tab_index){
			$("."+ elementID + "_loaded").each(function(){
				$(this).hide();
			});
			$(element).find(".jx_loader").show(); // make it so it works on multiple boxes!!
			$(element).find("." + content).show().fadeTo("normal", 0.2).load(
				url, 
				{}, 
				function(){
					$(element).find(".jx_loader").hide();
					$(element).find("." + content).hide().clone().show().insertAfter(this).removeClass(content).addClass(elementID +"_loaded " + elementID + "_content_" + tab_index).fadeTo("fast", 1); // clone the loaded div and place into the DOM for no AJAX re-call
					options.onComplete.call(self); // Any functions to call after completion
				}
			);
			
		}
		
		function hideTabContent(){ // to cut down on duplication of code
			tabs.each(function(index){
				element.find($(this).attr("href")).hide();
			});
		}
		
	}
	
	//---------------------------------
	// SLIDER CLASS
	// use: $(selectors).kaSlider(options)
	//---------------------------------
	$.fn.kaSlider = function(options){
		
		var options = $.extend({ // set the default options
			sliderHolderClass: "slider_holder",
			sliderTrackClass: "slider_track",
			sliderElementClass: "slider_item",
			sliderNextButton: "slider_next",
			sliderPreviousButton: "slider_previous",
			slideBy: 1,
			autoSlide: false,
			currentItemClass: "current_item",
			useTabs: false,
			sliderTabsClass: "slider_tabs",
			selectedTabClass: "highlighted",
			timer: { // if slider should cycle through like a semi slide show (requires jQuery Timers Plugin)
				isTimed: false,
				interval: null
			}
		}, options ||{});
		
		var element = $(this);
		var sliderHolder = element.find("." + options.sliderHolderClass).css({position:"relative", overflow:"hidden"});
		var sliderTrack = element.find("." + options.sliderTrackClass).css({position:"absolute"});
		var nextButton = element.find("." + options.sliderNextButton);
		var prevButton = element.find("." + options.sliderPreviousButton);
		var items = element.find("." + options.sliderElementClass).css({float:"left"});
		
		var wSlideBy = items.width() * options.slideBy; // Amount that the slider slides each click
		var wSliderTrack = items.width() * items.size(); // Width of track
		var wTotal =  (wSlideBy * (Math.ceil(wSliderTrack / wSlideBy))) - wSlideBy; // Complete length of track compensation
		var hSliderTrack = 0;
		var currentPosition = 0;
		var itemIndex = 0;

		if(options.useTabs){
			options.slideBy = 1;
			var tabs = element.find('.' + options.sliderTabsClass + " li a");
			$(tabs[0]).addClass(options.selectedTabClass);
				$(tabs).click(function(){
					tabs.removeClass(options.selectedTabClass);
					$(this).addClass(options.selectedTabClass);
					var index = tabs.index(this) + 1;
					moveByTab(index);
				});
		}
		
		setupSlider(); // run and create the visuals
		
		nextButton.click(function(){
			slideNext();
			options.timer.isTimed ? $(element).stopTime() : null; // stop the timer if there is one
		});
		prevButton.click(function(){
			slidePrevious();
			options.timer.isTimed ? $(element).stopTime() : null; // stop the timer if there is one
		});
		
		if(options.autoSlide){ // for sliding directly to an item
		  items.each(function(index){
		    if($(this).hasClass(options.currentItemClass)){ // find where the item is currently selected
		      itemIndex = index; 
		    }
		  });
		  autoSlide(); // slide to the current item
		}
		
		if(options.timer.isTimed){ // for cycling through items like a slide show
			$(element).everyTime(options.timer.interval, function() {
				slideNext();
			});
		}
		
		function autoSlide(){ // have slider slide on load and move to current item
			var moveTo = Math.floor(itemIndex / options.slideBy) * wSlideBy;
			sliderTrack.animate({left:-moveTo + "px"}, 500);
		}
		
		function slideNext(){ // slide forward
			if(options.useTabs){ // for setting the current tab class
				var tabIndex = Math.abs(sliderTrack.position().left / wSlideBy) + 1;
				if(tabIndex == tabs.size()){
					tabIndex = 0;
				}
				tabs.removeClass(options.selectedTabClass);
				$(tabs[tabIndex]).addClass(options.selectedTabClass);
			}
			if(currentPosition == wTotal){
				sliderTrack.animate({left:"0"}, 500);
				currentPosition = 0;
			}else{
				sliderTrack.animate({left:"-=" + wSlideBy + "px"}, 500);
				currentPosition = currentPosition + wSlideBy;
			}
			
			return false;
		}
		
		function slidePrevious(){ // slide backward
			
			if(options.useTabs){ // for setting the current tab class
				var tabIndex = Math.abs(sliderTrack.position().left / wSlideBy) - 1;
				if(tabIndex < 0){
					tabIndex = tabs.size() - 1;
				}
				tabs.removeClass(options.selectedTabClass);
				$(tabs[tabIndex]).addClass(options.selectedTabClass);
			}
			
			if(currentPosition == 0){
				sliderTrack.animate({left:-wTotal + "px"}, 500);
				currentPosition = wTotal;
			}else{
				sliderTrack.animate({left:"+=" + wSlideBy + "px"}, 500);
				currentPosition = currentPosition - wSlideBy;
			}
			
			options.timer.isTimed ? $(element).stopTime() : null; // stop the timer if there is one
			return false;
		}
		
		function setupSlider(){ // setup the visuals
			items.each(function(){
				if($(this).height() > hSliderTrack){
					hSliderTrack = $(this).height();
				}
			});

			sliderTrack.css({height: hSliderTrack + "px", width: wSliderTrack + "px"});
			sliderHolder.css({height: hSliderTrack + "px", width: wSlideBy + "px"});
		}
				
		
		function moveByTab(index){
			console.log("Index: " + index);
			var tabbedPosition = sliderTrack.position().left;
			var currentIndex = Math.abs(tabbedPosition / wSlideBy) + 1;
			console.log("Current: " + currentIndex);
			var theIndex = index - currentIndex;
			var moveBy = theIndex * wSlideBy;
			options.timer.isTimed ? $(element).stopTime() : null; // stop the timer if there is one
			sliderTrack.animate({left:"-="+moveBy + "px"}, 500);
			currentPosition = currentPosition + moveBy;
		}
	

	}
	
	//---------------------------------
	// EXPAND CLASS
	// use: $(selectors).kaTab(options)
	//
	// Expands/contracts specified divs
	//---------------------------------
	$.fn.kaPand = function(options){
		
		var options = $.extend({ // set the default options
			togglerClass: "kaPander",
			expandedClass: "expanded",
			hiddenElementClass: "hidden_element",
			toggledClass: "is_showing",
			hideText: "...show less"
		}, options ||{});
		
		var initialText;
		
		$(this).find("." + options.hiddenElementClass).hide();
		
		$(this).find("." + options.togglerClass).click(
			function(event){
				!$(this).hasClass(options.toggledClass) ? initialText = $(this).text() : null;
				$(this).prev("." + options.hiddenElementClass).toggle("blind");
				$(this).hasClass(options.toggledClass) ? $(this).html(initialText).removeClass(options.toggledClass) : $(this).html(options.hideText).addClass(options.toggledClass);
			}
		);
	}
	
	//-----------------------------
	// CENTER OBJECTS CLASS
	// use: $(selectors).kaCenter(options)
	//
	// Centers objects within viewport
	//-----------------------------
	$.fn.kaCenter = function(options) {
	   var pos = {
      sTop : function() {
        return window.pageYOffset
        || document.documentElement && document.documentElement.scrollTop
        ||  document.body.scrollTop;
      },
      wHeight : function() {
        return window.innerHeight
        || document.documentElement && document.documentElement.clientHeight
        || document.body.clientHeight;
      },
			sLeft : function() {
        return window.pageXOffset
        || document.documentElement && document.documentElement.scrollLeft
        ||  document.body.scrollLeft;
      },
      wWidth : function() {
        return window.innerWidth
        || document.documentElement && document.documentElement.clientWidth
        || document.body.clientWidth;
      }
    };
    return this.each(function(index) {
      if (index == 0) {
        var $this = $(this);
        var elHeight = $this.height();
				var elWidth = $this.width();
        var elTop = pos.sTop() + (pos.wHeight() / 2) - (elHeight / 2);
				var elLeft = pos.sLeft() + (pos.wWidth() / 2) - (elWidth / 2);	
        $this.css({
          position: 'absolute',
          marginTop: '0',
          top: elTop,
					left: elLeft
        });
      }
    });
  };

	//-----------------------------
	// SIMPLE TAGGING
	// use: $(selectors).kaCenter(options)
	//
	// Works like Delecious
	//-----------------------------
	$.fn.kaTagger = function(options) {
		var options = $.extend({ // set the default options
			tagsContainerClass: "tags_list",
			selectedClass: "selected",
			togglerClass: "toggle_link",
			moreTagsID: "more_tags",
			fakeInput: "fake_input"
		}, options ||{});

		var tags = $("." + options.tagsContainerClass).find(".tag");
		var tagsInput = $(this);
		var fakeInput = $("#" + options.fakeInput); // So that you cant type tags in
		var inputValue = tagsInput.val();
		var fakeValue = fakeInput.val();
		var toggleLink = $("." + options.tagsContainerClass).find("." + options.togglerClass);
		var moreTags = $("#" + options.moreTagsID);

		checkInput(); // lets select all the stuff first

		toggleLink.click(function(){
			$(moreTags).toggle();
			$(moreTags).css("display") != "none" ? toggleLink.html("&laquo; show less") : toggleLink.html("show more &raquo;");
		});

		tags.click(function(){
			var tagText = $(this).text();

			if($(this).hasClass(options.selectedClass)){
				if (inputValue == tagText){
					tagsInput.val("");
					fakeInput.val("");
				}else if (inputValue.beginsWith(tagText)){
					tagsInput.val(inputValue.replace(tagText + ", ", ""));
					fakeInput.val(inputValue.replace(tagText + ", ", ""));
				}else{
					tagsInput.val(inputValue.replace(", " + tagText, ""));
					fakeInput.val(inputValue.replace(", " + tagText, ""));
				}
				$(this).removeClass(options.selectedClass);

			}else{
				inputValue == "" ? tagsInput.val(tagText) : tagsInput.val(inputValue + ", " + tagText);
				fakeValue == "" ? fakeInput.val(tagText) : fakeInput.val(inputValue + ", " + tagText);
				$(this).addClass(options.selectedClass);
			}

			inputValue = tagsInput.val();
			fakeValue = fakeInput.val();
		});

		function checkInput(){

			var currentInput = inputValue.replace(/, /g, ","); //Remove space, but keep the 
			currentInput = currentInput.replace(/ /g, '_'); //For any tag that might be multiple words with a space
	    currentInput = currentInput.replace(/,/g, ' '); //Ready the transformed string for the array
			var inputArray = new Array();
			inputArray = currentInput.split(" ");

			$.each(inputArray, function(n, value){
				tags.each(function(){
					$(this).text().replace(/ /g, '_') == value ? $(this).addClass("selected") : null;
				});
			});
		}

	}
	
	//-----------------------------
	// WINDOW SCROLLER BUILDER
	// use: $(selectors).kaScroller(options)
	// 
	// For scrolling window to points on page - requires ScrollTo JS
	//-----------------------------
	$.fn.kaScroller = function(options){

		var options = $.extend({
			duration: 800 // how quick is it
		}, options || {} );

		$(this).click(function(){
			$.scrollTo($(this).attr("href"), options.duration);
			return false;
		});

	}

})(jQuery);
