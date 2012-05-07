// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

Timeline_urlPrefix = "http://api.simile-widgets.org/timeline/2.3.1/";;
        
var t1;
var spanDecorators = [];
        
function loadSpans( sp ){
	spanDecorators = sp;
}
function newDecorators( sp ){
	_spanDecorators = [];
	for (var i = 0; i < sp.length; i++) {
		_spanDecorators.push( new Timeline.SpanHighlightDecorator(sp[i]) );
	}
	return _spanDecorators;
}
    
function initTimeline( eventURL ) {
	SimileAjax.History.enabled = false;
	
        var theme = Timeline.ClassicTheme.create(); // create the theme
            theme.timeline_start = new Date(Date.UTC(1775,1,1,20,00,00,0));
            theme.timeline_stop = new Date(Date.UTC(1925,12,31,20,00,00,0));
            theme.event.highlightLabelBackground = true;
			theme.event.highlightColors = [ "#ffff00", "#ffc000", "#DF868A", "#62C45C" ];

        var overview_theme = Timeline.ClassicTheme.create(); // create the theme
            //overview_theme.ether.backgroundColors = "#ff0000";
            
            
        var eventSource = new Timeline.DefaultEventSource();
        var bandInfos = [
        Timeline.createBandInfo({
             eventSource:    eventSource,
            date:           "Jan 01 1839 00:00:00 GMT",
            width:          "80%", 
            intervalUnit:   Timeline.DateTime.MONTH,
            theme:          theme, 
            intervalPixels: 100
        }),
        Timeline.createBandInfo({
            overview:       true,
            eventSource:    eventSource,
            date:           "Jan 01 1839 00:00:00 GMT",
            theme:	    overview_theme,
            width:          "20%", 
            intervalUnit:   Timeline.DateTime.DECADE, 
            intervalPixels: 200
        })
        ];
        
        bandInfos[1].syncWith = 0;
        bandInfos[1].highlight = true;
       
       //Band highlighting - saved for later.
       for (var i = 0; i < bandInfos.length; i++) {
                bandInfos[i].decorators = newDecorators(spanDecorators);
       }
            
            
        t1 = Timeline.create(document.getElementById("my-timeline"), bandInfos);
        
        Timeline.loadJSON(eventURL, 
			function(data, url) { 
				eventSource.loadJSON(data, url);
			});
	
        setupFilterHighlightControls(document.getElementById("pstl_controls"), t1, [0,1], theme);
}

var resizeTimerID = null;
function onResize() {
	    if (resizeTimerID == null) {
		resizeTimerID = window.setTimeout(function() {
		    resizeTimerID = null;
		    tl.layout();
		}, 500);
	    }
}
        
        
function highlight(){
}

// Unfortunately, the timeline escapes the title when used in a popup. This intercepts the bubble creation and
// changes the title back to what it should be. At the time that it is intercepted, the element isn't on the page,
// so the actual work is done in the setTimeout function that will come back after the page is rendered.
Timeline.DefaultEventSource.Event.prototype.oldFillInfoBubble = Timeline.DefaultEventSource.Event.prototype.fillInfoBubble;
Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function(element, theme, labeller) {
	Timeline.DefaultEventSource.Event.prototype.oldFillInfoBubble.call(this, element, theme, labeller);
	setTimeout(function() {
		// straighten out the title
		var elements = $(".timeline-event-bubble-title");
		elements.each(function() {
			var title = this.innerHTML.replace(/\&lt;/g, '<').replace(/\&gt;/g, '>').replace(/\&amp;/g, '&');
			$(this).html(title);
		});

		// remove the time portion of the date display
		elements = $(".timeline-event-bubble-time");
		elements.each(function() {
			var date = this.innerHTML.replace(/ 00:00:00 GMT/g, '');
			$(this).html(date);
		});
		
		// Move the time to the top
		$(".timeline-event-bubble-body").prepend($(".timeline-event-bubble-time"));
		
		// Move the image inside the body
		$(".timeline-event-bubble-body").prepend($(".timeline-event-bubble-image"));
	}, 10);
};


function centerSimileAjax(date) {
    tl.getBand(0).setCenterVisibleDate(SimileAjax.DateTime.parseGregorianDateTime(date));
}

function newElement(parent, typ, klass, inner) {
	var el = document.createElement(typ);
	parent.appendChild(el);
	if (klass && klass.length > 0)
		$(el).addClass(klass);
	if (inner && inner.length > 0)
		el.innerHTML = inner;
	return el;
}

function newInput(parent, klass) {
	var el = newElement(parent, "input", klass);
	el.type = "text";
	return el;
}

function setupFilterHighlightControls(parent, timeline, bandIndices, theme) {
	var filterContainer = newElement(parent, "div", "pstl_filter");
	var filterLabel = newElement(filterContainer, "div", "pstl_label", "Filter:");

	var highlightContainer = newElement(parent, "div", "pstl_highlight");
	var highlightLabel = newElement(highlightContainer, "div", "pstl_label", "Highlight:");

    var handler = function(elmt, evt, target) {
        onKeyPress(timeline, bandIndices, parent);
    };
    
    var input = newInput(filterContainer);
    SimileAjax.DOM.registerEvent(input, "keypress", handler);
    
    for (var i = 0; i < theme.event.highlightColors.length; i++) {
	    input = newInput(highlightContainer);
        SimileAjax.DOM.registerEvent(input, "keypress", handler);
	}
	newElement(highlightContainer, "br");
        
    for (i = 0; i < theme.event.highlightColors.length; i++) {
        var divColor = newElement(highlightContainer, "div", "pstl_highlight_color");
        divColor.style.background = theme.event.highlightColors[i];
    }
    
    var button = newElement(parent, "button", "pstl_clear", "Clear All");
    SimileAjax.DOM.registerEvent(button, "click", function() {
        clearAll(timeline, bandIndices, parent);
    });
}

// function old_setupFilterHighlightControls(div, timeline, bandIndices, theme) {
//     var table = document.createElement("table");
//     var tr = table.insertRow(0);
//     
//     var td = tr.insertCell(0);
//     td.innerHTML = "Filter:";
//     
//     td = tr.insertCell(1);
//     td.innerHTML = "Highlight:";
//     
//     var handler = function(elmt, evt, target) {
//         onKeyPress(timeline, bandIndices, table);
//     };
//     
//     tr = table.insertRow(1);
//     tr.style.verticalAlign = "top";
//     
//     td = tr.insertCell(0);
//     
//     var input = document.createElement("input");
//     input.type = "text";
//     SimileAjax.DOM.registerEvent(input, "keypress", handler);
//     td.appendChild(input);
//     
//     for (var i = 0; i < theme.event.highlightColors.length; i++) {
//         td = tr.insertCell(i + 1);
//         
//         input = document.createElement("input");
//         input.type = "text";
//         SimileAjax.DOM.registerEvent(input, "keypress", handler);
//         td.appendChild(input);
//         
//         var divColor = document.createElement("div");
//         divColor.style.height = "0.5em";
//         divColor.style.background = theme.event.highlightColors[i];
//         td.appendChild(divColor);
//     }
//     
//     td = tr.insertCell(tr.cells.length);
//     var button = document.createElement("button");
//     button.innerHTML = "Clear All";
//     SimileAjax.DOM.registerEvent(button, "click", function() {
//         clearAll(timeline, bandIndices, table);
//     });
//     td.appendChild(button);
//     
//     div.appendChild(table);
// }

var timerID = null;
function onKeyPress(timeline, bandIndices, table) {
    if (timerID != null) {
        window.clearTimeout(timerID);
    }
    timerID = window.setTimeout(function() {
        performFiltering(timeline, bandIndices, table);
    }, 300);
}
function cleanString(s) {
    return s.replace(/^\s+/, '').replace(/\s+$/, '');
}
function performFiltering(timeline, bandIndices, table) {
    timerID = null;

    var text;
	var els = $(table).find(".pstl_filter input");
	els.each(function() { text = cleanString(this.value); });
    
    var filterMatcher = null;
    if (text.length > 0) {
        var regex = new RegExp(text, "i");
        filterMatcher = function(evt) {
            return regex.test(evt.getText()) || regex.test(evt.getDescription());
        };
    }
    
    var regexes = [];
    var hasHighlights = false;
	els = $(table).find(".pstl_highlight input");
	els.each(function() { 
		text = cleanString(this.value); 
        if (text.length > 0) {
            hasHighlights = true;
            regexes.push(new RegExp(text, "i"));
        } else {
            regexes.push(null);
        }
	});
	
    var highlightMatcher = hasHighlights ? function(evt) {
        var text = evt.getText();
        var description = evt.getDescription();
        for (var x = 0; x < regexes.length; x++) {
            var regex = regexes[x];
            if (regex != null && (regex.test(text) || regex.test(description))) {
                return x;
            }
        }
        return -1;
    } : null;
    
    for (var i = 0; i < bandIndices.length; i++) {
        var bandIndex = bandIndices[i];
        timeline.getBand(bandIndex).getEventPainter().setFilterMatcher(filterMatcher);
        timeline.getBand(bandIndex).getEventPainter().setHighlightMatcher(highlightMatcher);
    }
    timeline.paint();
}
function clearAll(timeline, bandIndices, table) {
	var els = $(table).find(".pstl_filter input");
	els.each(function() { this.value = ""; });
	els = $(table).find(".pstl_highlight input");
	els.each(function() { this.value = ""; });

    for (var i = 0; i < bandIndices.length; i++) {
        var bandIndex = bandIndices[i];
        timeline.getBand(bandIndex).getEventPainter().setFilterMatcher(null);
        timeline.getBand(bandIndex).getEventPainter().setHighlightMatcher(null);
    }
    timeline.paint();
}
