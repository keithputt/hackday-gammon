var cheerio = require("cheerio");

var reAlpha = /[a-zA-Z]/
var rePunctuation = /[\.\,]/m
var reWhitespace = /[\s]*/m
var reWords = /[a-zA-Z]*[\s$]/m

var debug = false;

exports.parse = function parse(content)
{
	var $ = cheerio.load(content);

	var hd = getHeadline($, $("h1"));

	if ( debug )
		console.log( " [x] Removing markup");

	$("script").remove();
	$("noscript").remove();
	$("style").remove();
	$("img").remove();
	$("link").remove();
	$("meta").remove();
	$("head").remove();
	$("a").remove();
	$("input").remove();
	$("noscript").remove();
	$("label").remove();
	$("button").remove();

	if ( debug )
		console.log( " [x] Stripping content");

	removeEmptyElements($, $("body"));

	return { title: hd, content: extractFormattedText( $, $("body") ) };
}

function getHeadline($, node)
{
	return $(node).first().text().trim();
}

function nodeText( $, node )
{
	return $(node).first().contents().filter(function() {
    		return this.type === 'text';
	}).text().trim();
}


function clearText( $, node )
{
        $(node).first().contents().filter(function() {
                return this.type === 'text';
        }).remove();
}

function trimText( $, node )
{
        $(node).first().contents().filter(function() {
                return this.type === 'text';
        }).each( function(i, elem) {
		var str = $(elem).text();
		$(elem).text(str.trim());
	});
}



function removeEmptyElements($, node)
{
	var elementName = $(node).prop('name');
	var nodeRemoved = true;
	var childrenRemoved = true;

	$(node).children().each( function(i, elem) {
		childrenRemoved &= removeEmptyElements( $, $(this) );
	});

	var innerHtml = nodeText($, node);

	// Check if we have valid content in the node, not including its descendents
	if ( !hasContent( innerHtml ) )
	{
		// No, did we remove all the child nodes?
		if ( childrenRemoved )
		{
			// Yes, so let's remove this node too and indicate in return result
			if ( debug )
				console.log( " [x] removing '"+elementName + "/" + $(this).attr("id") );
			$(node).remove();
			nodeRemoved = true;
		}
		else
		{
			// Child nodes exist, must have valid content, let's just clear this one
			if ( debug )
				console.log( " [x] clearing '"+elementName + "/" + $(this).attr("id") );
			clearText( $, node );
			nodeRemoved = false;
		}
	}
	else
	{
		// Valid content in here, don't delete anything
		nodeRemoved = false;
	}

	return nodeRemoved;
}


function extractFormattedText($, node)
{
        var elementName = $(node).prop('name');
        var nodeRemoved = true;
        var childrenRemoved = true;

	var text = nodeText( $, node ).trim();

	if ( text != "" )
		text += '\n\n';

        $(node).children().each( function(i, elem) {
                text += extractFormattedText( $, $(this) );
        });

	return text;

}


function hasContent( html )
{
	var result = true;

	// Check we have letters
	var alphabeticIdx = html.search(reAlpha);

	var punctuationCount = html.split(rePunctuation).length-1;

	var spaceCount = html.split(reWhitespace).length-1;

	var wordCount = html.trim().split(reWords).length;

	if ( debug )
	{
		console.log(  "+------------------------------------------------");
		console.log(  "|" + html );
		console.log(  "+------------------------------------------------");
		console.log(  "| Alphabetic Idx = " + alphabeticIdx );
		console.log(  "| Punctuation = " + punctuationCount );
		console.log(  "| Spaces = " + spaceCount );
		console.log(  "| Words = " + wordCount );
		console.log(  "+------------------------------------------------");
	}
	// The secret sauce

	result &= alphabeticIdx > -1;
	result &= punctuationCount >= 1;
	result &= spaceCount > 10;

	if ( debug )
	{
		var sResult = "";
		if ( result )
			sResult = 'Yes';
		else
			sResult = 'No';
		console.log(  "+------------------------------------------------");
		console.log(  "| Outcome: Is Content = " + sResult );
		console.log(  "+------------------------------------------------");
	}

	return result;
}
