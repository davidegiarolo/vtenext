/*---------------------------------------------------------
  Setup, Layout, and Status Functions
---------------------------------------------------------*/

// Sets paths to connectors based on language selection.
var treeConnector = 'scripts/jquery.filetree/connectors/jqueryFileTree.' + lang;
var fileConnector = 'connectors/' + lang + '/filemanager.' + lang;

// function to retrieve GET params
$.urlParam = function(name){
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	return results[1] || 0;
}

// Get localized messages from file 
// through culture var or from URL
if($.urlParam('langCode') != 0 && file_exists ('scripts/languages/'  + $.urlParam('langCode') + '.js')) culture = $.urlParam('langCode');
var lg = [];
$.ajax({
  url: 'scripts/languages/'  + culture + '.js',
  async: false,
  dataType: 'json',
  success: function (json) {
    lg = json;
  }
});

// Options for alert, prompt, and confirm dialogues.
$.SetImpromptuDefaults({
	overlayspeed: 'fast',
	show: 'fadeIn',
	opacity: 0.4
});

// Forces columns to fill the layout vertically.
// Called on initial page load and on resize.
var setDimensions = function(){
	var newH = $(window).height() - 50;	
	$('#splitter, #filetree, #fileinfo, .vsplitbar').height(newH);
}

// Test if a given url exists
function file_exists (url) {
    // http://kevin.vanzonneveld.net
    // +   original by: Enrique Gonzalez
    // +      input by: Jani Hartikainen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
    // %        note 1: Synchronous so may lock up browser, mainly here for study purposes. 
    // *     example 1: file_exists('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '123'
    var req = this.window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    if (!req) {
        throw new Error('XMLHttpRequest not supported');
    }

    // HEAD Results are usually shorter (faster) than GET
    req.open('HEAD', url, false);
    req.send(null);
    if (req.status == 200) {
        return true;
    }

    return false;
}

// Sets the folder status, upload, and new folder functions 
// to the path specified. Called on initial page load and 
// whenever a new directory is selected.
var setUploader = function(path){
	$('#currentpath').val(path);
	$('#uploader h1').text(lg.current_folder+': ' + path);

	$('#newfolder').unbind().click(function(){
		// var foldername = prompt('Enter the name of the new folder:', 'My Folder');
		var foldername =  lg.default_foldername;
		var msg = lg.prompt_foldername+': <input id="fname" name="fname" type="text" value="' + foldername + '" />';
		
		var getFolderName = function(v, m){
			if(v != 1) return false;		
			var fname = m.children('#fname').val();		

			if(fname != ''){
				foldername = fname;

				$.getJSON(fileConnector + '?mode=addfolder&path=' + $('#currentpath').val() + '&name=' + foldername, function(result){
					if(result['Code'] == 0){
						addFolder(result['Parent'], result['Name']);
						getFolderInfo(result['Parent']);
					} else {
						$.prompt(result['Error']);
					}				
				});
			} else {
				$.prompt(lg.no_foldername);
			}
		}
		var btns = {}; 
		btns[lg.create_folder] = true; 
		btns[lg.cancel] = false; 
		$.prompt(msg, {
			callback: getFolderName,
			buttons: btns 
		});
	});	
}

// Binds specific actions to the toolbar in detail views.
// Called when detail views are loaded.
var bindToolbar = function(data){
	// this little bit is purely cosmetic
	$('#fileinfo').find('button').wrapInner('<span></span>');

	$('#fileinfo').find('button#select').click(function () { selectItem(data); }).show();
        if(window.opener || window.tinyMCEPopup) {
	        $('#preview img').attr('title', lg.select);
	        $('#preview img').click(function () { selectItem(data); }).css("cursor", "pointer");
        }
	
	$('#fileinfo').find('button#rename').click(function(){
		var newName = renameItem(data);
		if(newName.length) $('#fileinfo > h1').text(newName);
	}).show();

	$('#fileinfo').find('button#delete').click(function(){
		if(deleteItem(data)) $('#fileinfo').html('<h1>' + lg.select_from_left + '</h1>');
	}).show();
	
	$('#fileinfo').find('button#download').click(function(){
		window.location = fileConnector + '?mode=download&path=' + encodeURIComponent(data['Path']);
	}).show();
}

// Converts bytes to kb, mb, or gb as needed for display.
var formatBytes = function(bytes){
	var n = parseFloat(bytes);
	var d = parseFloat(1024);
	var c = 0;
	var u = [' bytes','kb','mb','gb'];
	
	while(true){
		if(n < d){
			n = Math.round(n * 100) / 100;
			return n + u[c];
		} else {
			n /= d;
			c += 1;
		}
	}
}

/*---------------------------------------------------------
  Item Actions
---------------------------------------------------------*/

// Calls the SetUrl function for FCKEditor compatibility,
// passes file path, dimensions, and alt text back to the
// opening window. Triggered by clicking the "Select" 
// button in detail views or choosing the "Select"
// contextual menu option in list views. 
// NOTE: closes the window when finished.
var selectItem = function(data){
	if(window.opener){
		if($.urlParam('CKEditor')){
			// use CKEditor 3.0 integration method
			window.opener.CKEDITOR.tools.callFunction($.urlParam('CKEditorFuncNum'), data['Path_real']);
		} else {
			// use FCKEditor 2.0 integration method
			if(data['Properties']['Width'] != ''){
				var p = data['Path_real'];
				var w = data['Properties']['Width'];
				var h = data['Properties']['Height'];			
				window.opener.SetUrl(p,w,h);
			} else {
				window.opener.SetUrl(data['Path_real']);
			}		
		}

		window.close();
	//crmv@24011
	} else if($.urlParam('HtmlReader')) {
		fileContent = parent.getFile(data['Path_real']);
		for(key in parent.CKEDITOR.instances){
			var oEditor = parent.CKEDITOR.instances[key];
	        oEditor.insertHtml(fileContent);
        }
        parent.jQuery.fancybox.close();
	//crmv@24011e
	} else {
		$.prompt(lg.fck_select_integration);
	}
}

// Renames the current item and returns the new name.
// Called by clicking the "Rename" button in detail views
// or choosing the "Rename" contextual menu option in 
// list views.
var renameItem = function(data){
	var finalName = '';
	var msg = lg.new_filename+': <input id="rname" name="rname" type="text" value="' + data['Filename'] + '" />';

	var getNewName = function(v, m){
		if(v != 1) return false;
		rname = m.children('#rname').val();
		
		if(rname != ''){
			var givenName = rname;	
			var oldPath = data['Path'];	
			var connectString = fileConnector + '?mode=rename&old=' + data['Path'] + '&new=' + givenName;
		
			$.ajax({
				type: 'GET',
				url: connectString,
				dataType: 'json',
				async: false,
				success: function(result){
					if(result['Code'] == 0){
						var newPath = result['New Path'];
						var newName = result['New Name'];
	
						updateNode(oldPath, newPath, newName);
						
						if($('#fileinfo').data('view') == 'grid'){
							$('#fileinfo img[alt="' + oldPath + '"]').next('p').text(newName);
							$('#fileinfo img[alt="' + oldPath + '"]').attr('alt', newPath);
						} else {
							$('#fileinfo td[title="' + oldPath + '"]').text(newName);
							$('#fileinfo td[title="' + oldPath + '"]').attr('title', newPath);
						}
										
						$.prompt('Rename successful.');
					} else {
						$.prompt(result['Error']);
					}
					
					finalName = result['New Name'];		
				}
			});	
		}
	}
	
	$.prompt(msg, {
		callback: getNewName,
		buttons: { 'Rename': 1, 'Cancel': 0 }
	});
	
	return finalName;
}

// Prompts for confirmation, then deletes the current item.
// Called by clicking the "Delete" button in detail views
// or choosing the "Delete contextual menu item in list views.
var deleteItem = function(data){
	var isDeleted = false;
	var msg = lg.confirmation_delete;
	
	var doDelete = function(v, m){
		if(v != 1) return false;	
		var connectString = fileConnector + '?mode=delete&path=' + data['Path'];
	
		$.ajax({
			type: 'GET',
			url: connectString,
			dataType: 'json',
			async: false,
			success: function(result){
				if(result['Code'] == 0){
					removeNode(result['Path']);
					isDeleted = true;
					$.prompt(lg.successful_delete);
				} else {
					isDeleted = false;
					$.prompt(result['Error']);
				}			
			}
		});	
	}
	
	$.prompt(msg, {
		callback: doDelete,
		buttons: { 'Yes': 1, 'No': 0 }
	});
	return isDeleted;
}





/*---------------------------------------------------------
  Functions to Update the File Tree
---------------------------------------------------------*/

// Adds a new node as the first item beneath the specified
// parent node. Called after a successful file upload.
var addNode = function(path, name){
	var ext = name.substr(name.lastIndexOf('.') + 1);
	var thisNode = $('#filetree').find('a[rel="' + path + '"]');
	var parentNode = thisNode.parent();
	var newNode = '<li class="file ext_' + ext + '"><a rel="' + path + name + '/" href="#">' + name + '/</a></li>';
	
	if(!parentNode.find('ul').size()) parentNode.append('<ul></ul>');		
	parentNode.find('ul').prepend(newNode);
	thisNode.click().click();

	getFolderInfo(path);

	$.prompt(lg.successful_added_file);
}

// Updates the specified node with a new name. Called after
// a successful rename operation.
var updateNode = function(oldPath, newPath, newName){
	var thisNode = $('#filetree').find('a[rel="' + oldPath + '"]');
	var parentNode = thisNode.parent().parent().prev('a');
	thisNode.attr('rel', newPath).text(newName);
	parentNode.click().click();
}

// Removes the specified node. Called after a successful 
// delete operation.
var removeNode = function(path){
	$('#filetree')
		.find('a[rel="' + path + '"]')
		.parent()
		.fadeOut('slow', function(){ 
			$(this).remove();
		});
}

// Adds a new folder as the first item beneath the
// specified parent node. Called after a new folder is
// successfully created.
var addFolder = function(parent, name){
	var newNode = '<li class="directory collapsed"><a rel="' + parent + name + '/" href="#">' + name + '/</a><ul class="jqueryFileTree" style="display: block;"></ul></li>';
	var parentNode = $('#filetree').find('a[rel="' + parent + '"]');

	if(parent != fileRoot){
		parentNode.next('ul').prepend(newNode).prev('a').click().click();
	} else {
		$('#filetree > ul').append(newNode);
	}
	
	$.prompt(lg.successful_added_folder);
}




/*---------------------------------------------------------
  Functions to Retrieve File and Folder Details
---------------------------------------------------------*/

// Decides whether to retrieve file or folder info based on
// the path provided.
var getDetailView = function(path){
	if(path.lastIndexOf('/') == path.length - 1){
		getFolderInfo(path);
		$('#filetree').find('a[rel="' + path + '"]').click();
	} else {
		getFileInfo(path);
	}
}

// Binds contextual menus to items in list and grid views.
var setMenus = function(action, path){
	$.getJSON(fileConnector + '?mode=getinfo&path=' + path, function(data){
		if($('#fileinfo').data('view') == 'grid'){
			var item = $('#fileinfo').find('img[alt="' + data['Path'] + '"]').parent();
		} else {
			var item = $('#fileinfo').find('td[title="' + data['Path'] + '"]').parent();
		}
	
		switch(action){
			case 'select':
				selectItem(data);
				break;
			
			case 'download':
				window.location = fileConnector + '?mode=download&path=' + data['Path'];
				break;
				
			case 'rename':
				var newName = renameItem(data);
				break;
				
			case 'delete':
				// TODO: When selected, the file is deleted and the
				// file tree is updated, but the grid/list view is not.
				if(deleteItem(data)) item.fadeOut('slow', function(){ $(this).remove(); });
				break;
		}
	});
}

// Retrieves information about the specified file as a JSON
// object and uses that data to populate a template for
// detail views. Binds the toolbar for that detail view to
// enable specific actions. Called whenever an item is
// clicked in the file tree or list views.
var getFileInfo = function(file){
	// Update location for status, upload, & new folder functions.
	var currentpath = file.substr(0, file.lastIndexOf('/') + 1);
	setUploader(currentpath);

	// Include the template.
	var template = '<div id="preview"><img /><h1></h1><dl></dl></div>';
	template += '<form id="toolbar">';
	if(window.opener || window.tinyMCEPopup) template += '<button id="select" name="select" type="button" value="Select">' + lg.select + '</button>';
	template += '<button id="download" name="download" type="button" value="Download">' + lg.download + '</button>';
	template += '<button id="rename" name="rename" type="button" value="Rename">' + lg.rename + '</button>';
	template += '<button id="delete" name="delete" type="button" value="Delete">' + lg.del + '</button>';
	template += '<button id="parentfolder">' + lg.parentfolder + '</button>';
	template += '</form>';
	
	$('#fileinfo').html(template);
	$('#parentfolder').click(function() {getFolderInfo(currentpath);});
	
	// Retrieve the data & populate the template.
	var d = new Date(); // to prevent IE cache issues
	$.getJSON(fileConnector + '?mode=getinfo&path=' + encodeURIComponent(file) + '&time=' + d.getMilliseconds(), function(data){
		if(data['Code'] == 0){
			$('#fileinfo').find('h1').text(data['Filename']).attr('title', file);
			$('#fileinfo').find('img').attr('src',data['Preview']);
			var properties = '';
			
			if(data['Properties']['Width'] && data['Properties']['Width'] != '') properties += '<dt>' + lg.dimensions + '</dt><dd>' + data['Properties']['Width'] + 'x' + data['Properties']['Height'] + '</dd>';
			if(data['Properties']['Date Created'] && data['Properties']['Date Created'] != '') properties += '<dt>' + lg.created + '</dt><dd>' + data['Properties']['Date Created'] + '</dd>';
			if(data['Properties']['Date Modified'] && data['Properties']['Date Modified'] != '') properties += '<dt>' + lg.modified + '</dt><dd>' + data['Properties']['Date Modified'] + '</dd>';
			if(data['Properties']['Size'] || parseInt(data['Properties']['Size'])==0) properties += '<dt>' + lg.size + '</dt><dd>' + formatBytes(data['Properties']['Size']) + '</dd>';
			$('#fileinfo').find('dl').html(properties);
			
			// Bind toolbar functions.
			bindToolbar(data);
		} else {
			$.prompt(data['Error']);
		}
	});	
}

// Retrieves data for all items within the given folder and
// creates a list view. Binds contextual menu options.
// TODO: consider stylesheet switching to switch between grid
// and list views with sorting options.
var getFolderInfo = function(path){
	// Update location for status, upload, & new folder functions.
	setUploader(path);

	// Display an activity indicator.
	$('#fileinfo').html('<img id="activity" src="images/wait30trans.gif" width="30" height="30" />');

	// Retrieve the data and generate the markup.
	$.getJSON(fileConnector + '?path=' + path + '&mode=getfolder&showThumbs=' + showThumbs, function(data){		
		var result = '';
	
		if(data){		
			if($('#fileinfo').data('view') == 'grid'){
				result += '<ul id="contents" class="grid">';
				
				for(key in data){
					var props = data[key]['Properties'];
				
					var scaledWidth = 64;
					var actualWidth = props['Width'];
					if(actualWidth > 1 && actualWidth < scaledWidth) scaledWidth = actualWidth;
				
					result += '<li><div class="clip"><img src="' + data[key]['Preview'] + '" width="' + scaledWidth + '" alt="' + data[key]['Path'] + '" /></div><p>' + data[key]['Filename'] + '</p>';
					if(props['Width'] && props['Width'] != '') result += '<span class="meta dimensions">' + props['Width'] + 'x' + props['Height'] + '</span>';
					if(props['Size'] && props['Size'] != '') result += '<span class="meta size">' + props['Size'] + '</span>';
					if(props['Date Created'] && props['Date Created'] != '') result += '<span class="meta created">' + props['Date Created'] + '</span>';
					if(props['Date Modified'] && props['Date Modified'] != '') result += '<span class="meta modified">' + props['Date Modified'] + '</span>';
					result += '</li>';
				}
				
				result += '</ul>';
			} else {
				result += '<table id="contents" class="list">';
				result += '<thead><tr><th class="headerSortDown"><span>Name</span></th><th><span>Dimensions</span></th><th><span>Size</span></th><th><span>Modified</span></th></tr></thead>';
				result += '<tbody>';
				
				for(key in data){
					var path = data[key]['Path'];
					var props = data[key]['Properties'];					
					result += '<tr>';
					result += '<td title="' + path + '">' + data[key]['Filename'] + '</td>';

					if(props['Width'] && props['Width'] != ''){
						result += ('<td>' + props['Width'] + 'x' + props['Height'] + '</td>');
					} else {
						result += '<td></td>';
					}
					
					if(props['Size'] && props['Size'] != ''){
						result += '<td><abbr title="' + props['Size'] + '">' + formatBytes(props['Size']) + '</abbr></td>';
					} else {
						result += '<td></td>';
					}
					
					if(props['Date Modified'] && props['Date Modified'] != ''){
						result += '<td>' + props['Date Modified'] + '</td>';
					} else {
						result += '<td></td>';
					}
				
					result += '</tr>';					
				}
								
				result += '</tbody>';
				result += '</table>';
			}			
		} else {
			result += '<h1>Could not retrieve folder contents.</h1>';
		}
		
		// Add the new markup to the DOM.
		$('#fileinfo').html(result);
		
		// Bind click events to create detail views and add
		// contextual menu options.
		if($('#fileinfo').data('view') == 'grid'){
			$('#fileinfo').find('#contents li').click(function(){
				var path = $(this).find('img').attr('alt');
				getDetailView(path);
			}).contextMenu({ menu: 'itemOptions' }, function(action, el, pos){
				var path = $(el).find('img').attr('alt');
				setMenus(action, path);
			});
		} else {
			$('#fileinfo').find('td:first-child').each(function(){
				var path = $(this).attr('title');
				var treenode = $('#filetree').find('a[rel="' + path + '"]').parent();
				$(this).css('background-image', treenode.css('background-image'));
			});
			
			$('#fileinfo tbody tr').click(function(){
				var path = $('td:first-child', this).attr('title');
				getDetailView(path);		
			}).contextMenu({ menu: 'itemOptions' }, function(action, el, pos){
				var path = $('td:first-child', el).attr('title');
				setMenus(action, path);
			});
			
			$('#fileinfo').find('table').tablesorter({
				textExtraction: function(node){					
					if($(node).find('abbr').size()){
						return $(node).find('abbr').attr('title');
					} else {					
						return node.innerHTML;
					}
				}
			});
		}
	});
}





/*---------------------------------------------------------
  Initialization
---------------------------------------------------------*/

$(function(){
	// Adjust layout.
	setDimensions();
	$(window).resize(setDimensions);

	// Provides support for adjustible columns.
	$('#splitter').splitter({
		initA: 200
	});

	// cosmetic tweak for buttons
	$('button').wrapInner('<span></span>');

	// Set initial view state.
	$('#fileinfo').data('view', 'grid');

	// Set buttons to switch between grid and list views.
	$('#grid').click(function(){
		$(this).addClass('ON');
		$('#list').removeClass('ON');
		$('#fileinfo').data('view', 'grid');
		getFolderInfo($('#currentpath').val());
	});
	
	$('#list').click(function(){
		$(this).addClass('ON');
		$('#grid').removeClass('ON');
		$('#fileinfo').data('view', 'list');
		getFolderInfo($('#currentpath').val());
	});
	$('#upload').append(lg.upload);
	$('#newfolder').append(lg.new_folder);
	$('#grid').attr('title', lg.grid_view);
	$('#list').attr('title', lg.list_view);
	$('#fileinfo h1').append(lg.select_from_left);
	$('#itemOptions a[href$="#select"]').append(lg.select);
	$('#itemOptions a[href$="#download"]').append(lg.download);
	$('#itemOptions a[href$="#rename"]').append(lg.rename);
	$('#itemOptions a[href$="#delete"]').append(lg.del);
		/** Input file Replacement */
		$('#browse').append('+');
		
		$('#browse').attr('title', lg.browse);
		$('#alt-fileinput').click(function() {
			$("#newfile").click();
		});
		$("#newfile").change(function() {
			$("#filepath").val($(this).val());
		});
		$("#uploader").submit(function() {
			$("#filepath").val('');
		});
		$("#filepath").change(function() {
			$("#newfile").val($(this).val());
		});
		/** Input file Replacement - end */	
	// Provide initial values for upload form, status, etc.
	setUploader(fileRoot);

	$('#uploader').attr('action', fileConnector);

	$('#uploader').ajaxForm({
		target: '#uploadresponse',
		success: function(result){
			eval('var data = ' + $('#uploadresponse').find('textarea').text());

			if(data['Code'] == 0){
				addNode(data['Path'], data['Name']);
			} else {
				$.prompt(data['Error']);
			}
		}
	});

	// Creates file tree.
    $('#filetree').fileTree({
		root: fileRoot,
		script: treeConnector,
		multiFolder: false,
		folderCallback: function(path){ getFolderInfo(path); },
		after: function(data){
			$('#filetree').find('li a').contextMenu(
				{ menu: 'itemOptions' }, 
				function(action, el, pos){
					var path = $(el).attr('rel');
					setMenus(action, path);
				}
			);
		}
	}, function(file){
		getFileInfo(file);
	});
});
