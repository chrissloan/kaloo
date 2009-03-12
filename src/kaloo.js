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
			tabsClass: "tabs", // the tabs
			contentClass: "tabbed_content", // the content
			activeClass: "active", // what the tab should look like active
			hideAll: false, // should all content be hidden
			hasCloser: false, // has an internal link to close the tab
			internalCloserClass: "tab_closer" // internal link closer class
		}, options ||{});
		
		// Set the objects
		var element = $(this);
		var tabs = element.find("ul:first." + options.tabsClass + " li a");

		
		var toShow = location.hash && $(this).children().is(location.hash) ? location.hash : ":first"; // Determin if a hash exists in url or not
		
		if (options.hasCloser){
			element.find("." + options.internalCloserClass)
				.click(
					function(event){
						element.children("div." + options.contentClass).hide();
			      tabs.parent().removeClass("active");
						return false;
					});
		}
		
		if(options.hideAll){ //should all the tabs be hidden
			element.children("div." + options.contentClass).hide();
		}else{
			if (toShow == ":first"){ // make the first tab active
				element.find("ul li a:first").parent().addClass(options.activeClass);
				element.children("div." + options.contentClass).not("div:first").hide();
			}else{ // make the tab with hash active and show accordingly
				element.find("ul li a[href='" + toShow + "']").parent().addClass(options.activeClass);
				element.children("div." + options.contentClass).not(toShow).hide();
			}
		}
		
		// event handler
		tabs.click(
			function(event){
				var theDiv = $(this).attr("href"); // grab the url for corresponding div
				tabs.parent().removeClass(options.activeClass);
				$(this).parent().addClass(options.activeClass);
				element.children("div." + options.contentClass).hide(); // hide everything
				element.children(theDiv).show();
				return false; // stop the page jump
			}
		);
		
		
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
			selectedTabClass: "highlighted"
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
		
		nextButton.click(slideNext);
		prevButton.click(slidePrevious);
		
		if(options.autoSlide){ // for sliding directly to an item
		  items.each(function(index){
		    if($(this).hasClass(options.currentItemClass)){ // find where the item is currently selected
		      itemIndex = index; 
		    }
		  });
		  autoSlide(); // slide to the current item
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

			sliderTrack.animate({left:"-="+moveBy + "px"}, 500);
			currentPosition = currentPosition + moveBy;
		}
	

	}
	
	//---------------------------------
	// EXPAND CLASS
	// use: $(selectors).kaTab(options)
	//---------------------------------
	$.fn.kaPand = function(options){
		
		var options = $.extend({ // set the default options
			togglerClass: "kaPander",
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
	
})(jQuery);
