
var main_doc;
var card_to_be_moved_index;
var card_div_element_to_be_moved;
var user_group_name;
var project_name;
var access_token;
var has_connect_once = 'false';
var num_entries = -1;
var local_changes = 'false';
var sync_timeout;
var animation_state;


//////////////////////////////////////////////////////////////////////////////
///////////////////////////////   Document   /////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function save_doc(is_local_change) {
	let serialData = Automerge.save(main_doc);
	var compressed = LZString.compressToUTF16(serialData);
	localStorage.setItem("SerializedAutomergeData", compressed);
	console.log("Original size: "+serialData.length+", saving size: "+compressed.length);
	if(is_local_change == true)
	{
		local_changes = 'true';
		localStorage.setItem("local_changes",local_changes);
	}
}

function delete_card(card_origin)
{
	let card_to_be_removed_index = find_index_for_card(card_origin.open_card,main_doc.open_cards)
	// delete card and following controls
	card_origin.parentNode.removeChild(card_origin);
	// delete in data
	main_doc = Automerge.change(main_doc, doc => {
		doc.open_cards.deleteAt(card_to_be_removed_index)
	})
	save_doc(true);
}

function delete_all_data() {
	//localStorage.clear(); // may be too much
	localStorage.removeItem("SerializedAutomergeData");
	// synch data?
	localStorage.removeItem("user_group_name");
	localStorage.removeItem("project_name");
	localStorage.removeItem("access_token");
	localStorage.removeItem("has_connect_once");
	localStorage.removeItem("num_entries");
	localStorage.removeItem("local_changes");
	localStorage.removeItem("sync_timeout");
	location.reload();  // so lazy...
}

function return_to_open_card(card_origin,open_cards_view)
{
	let card_to_be_finished_index = find_index_for_card(card_origin.open_card,main_doc.finished_cards)
	// move html
	open_cards_view.appendChild(card_origin)
	main_doc = Automerge.change(main_doc, doc => {
		doc.open_cards.push(
			doc.finished_cards.splice(card_to_be_finished_index, 1)[0]
		)
	})
	save_doc(true)
	close_all_accordions()
}


function find_index_for_card(open_card,card_list) {
	for (i = 0; i < card_list.length; i++) {
		if (card_list[i]._objectId == open_card._objectId)
			return i
	}
	return undefined
}

function finish_card(card_origin,finished_cards_view)
{
	let card_to_be_finished_index = find_index_for_card(card_origin.open_card,main_doc.open_cards)
	// move html
	finished_cards_view.appendChild(card_origin)
	main_doc = Automerge.change(main_doc, doc => {
		doc.open_cards[card_to_be_finished_index].date_finished = Date.now();
		doc.finished_cards.push(
			doc.open_cards.splice(card_to_be_finished_index, 1)[0]
		)
	})
	save_doc(true)
	close_all_accordions()
}


//////////////////////////////////////////////////////////////////////////////
////////////////////////////     File access     /////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function addPadding(str)
{
	return String(str).padStart(2,"0");
}

function download_file()
{
	var currentdate = new Date(); 
	var datetime =
			"_" +  currentdate.getFullYear() + "_" 
				+ addPadding((currentdate.getMonth()+1)) + "_"   
				+ addPadding(currentdate.getDate()) + "_"
                + addPadding(currentdate.getHours()) + "_"  
                + addPadding(currentdate.getMinutes());
                //+ currentdate.getSeconds();
	let serialDoc = LZString.compressToUTF16(Automerge.save(main_doc));
	download(serialDoc,project_name+datetime+".scrub2","application/octet-stream")
}

function upload_selected_file( file, mergeData )
{;
	readTextFile(file, mergeData);
}

function readTextFile(file, mergeData)
{
		var fr = new FileReader();
		fr.onload = function(e)
			{
				upload_file(fr.result, mergeData);
			};
		fr.readAsText(file);
}

function upload_file(serialData, mergeData)
{
	//console.log(serialData);
	//console.log(LZString.decompressFromUTF16(serialData));
	if(!mergeData)
	{
		console.log("New data");
		main_doc = Automerge.load(LZString.decompressFromUTF16(serialData));
	}
	else
	{
		console.log("Merging data");
		let remote_doc_unserialized = Automerge.load(LZString.decompressFromUTF16(serialData));
		let test_doc = Automerge.merge(main_doc, remote_doc_unserialized)
		main_doc = test_doc;
	}
	save_doc(false);
	update_data_view();
	show_open_cards();
}


function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

//////////////////////////////////////////////////////////////////////////////
////////////////////////////   Synchronization   /////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function check_result_error(resultObj) {
	if (!resultObj.db_success) // check db
	{
		add_synchronize_feedback(`
			<div class="c-alert c-alert--error">
			Server DB error:`+ resultObj.error_message + `</div>`);
		return true;
	}
	if (!resultObj.access_granted) // check access
	{
		add_synchronize_feedback(`
			<div class="c-alert c-alert--error">
			Access denied</div>`);
		return true;
	}
	if (resultObj.error) // general error
	{
		add_synchronize_feedback(`
			<div class="c-alert c-alert--error">
			`+ resultObj.error_message + `</div>`);
		return true;
	}
	return false;
}

function synchronize() {
	console.log('synchronize');
	hide_all_pages();
	//clear_children(document.getElementById('synhronize_step_list_id'));
	let page = document.getElementById('synhronize_id');
	animate_page(page);
	page.style.display = 'inline';
}


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////   UI actions  / ///////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function check_data_and_save(card_origin) {
	let changed = false
	let card_index = find_index_for_card(card_origin.open_card,main_doc.open_cards)
	if (card_index == undefined) {
		console.log("Could not find card index for card "
			+ card_origin)
		return
	}
	let title_input = card_origin.querySelector('.title_input_text')
	let description_input = card_origin.querySelector('.description_input_text')
	let point_select = card_origin.querySelector('.point_select')
	// check titlechanged
	if (title_input.value
		!= card_origin.open_card.title) {
		changed = true;
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards[card_index].title = title_input.value
		})
		card_origin.getElementsByClassName('card_header_title')[0].innerHTML
		  = title_input.value;
	}
	// check titlechanged
	if (description_input.value
		!= card_origin.open_card.description) {
		changed = true;
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards[card_index].description
				= description_input.value
		})
	}
	// check points
	if (point_select.value
		!= card_origin.open_card.points) {
		changed = true;
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards[card_index].points
				= Number(point_select.value)
		})
	}
	if (changed) {
		console.log("Local data changed after edit");
		save_doc(true)
		card_origin.open_card = main_doc.open_cards[card_index]
	}
}

function click_return_to_open(element) {
	console.log('Finish')
	let open_cards_view = document.getElementById('open_cards_id');
	let card_origin = find_ancestor(element, "card-origin");
	if(is_animation_on())
	{
	  anime({
		targets: card_origin,
		translateX: -(window.innerWidth - card_origin.getBoundingClientRect().left),
		easing: 'easeInQuad',
		duration: 500,
		complete: function(anim) {
			return_to_open_card(card_origin,open_cards_view);
			card_origin.style.transform = 'translateX(0)';
		  }
	  });
	}
	else
	{
		return_to_open_card(card_origin,open_cards_view);
	}
}

function click_finish(element) {
	console.log('Finish')
	let finished_cards_view = document.getElementById('finished_cards_id');
	let card_origin = find_ancestor(element, "card-origin");
	if(is_animation_on())
	{
	  anime({
		targets: card_origin,
		translateX: window.innerWidth - card_origin.getBoundingClientRect().left,
		easing: 'easeInQuad',
		duration: 500,
		complete: function(anim) {
			finish_card(card_origin,finished_cards_view);
			card_origin.style.transform = 'translateX(0)';
		  }
	  });
	}
	else
	{
		finish_card(card_origin,finished_cards_view);
	}
}

function click_cancel()
{
	unselect_selected_card();
	cancel_all_edits();
}

function click_delete(element) {
	console.log('Delete')
	if(main_doc.open_cards.length > 1)
	{
		let card_origin = find_ancestor(element, "card-origin");
		if(is_animation_on())
		{
		anime({
			targets: card_origin,
			scale: 0.0,
			easing: 'easeInQuad',
			duration: 500,
			complete: function(anim) {
				delete_card(card_origin);
			}
		});
		}
		else
		{
			delete_card(card_origin);
		}
	}
	else
	{
		// Fixme feedback: do not delete last card.
	}
}

function click_add(element) {
	console.log('add')
	let card_origin = find_ancestor(element, "card-origin");
	console.log('behind pos')
	// find index for document in front
	let previous_card_index =
		find_index_for_card(card_origin.open_card,main_doc.open_cards)
	// generate new card
	main_doc = Automerge.change(main_doc, doc => {
		doc.open_cards.insertAt(previous_card_index + 1,
			{
				title: 'New',
				description: '',
				date_added: Date.now(),
				date_finished: '0',
				points: 0
			})
	})
	// add html
	let raw_html_string =
		create_card_html(main_doc.open_cards[previous_card_index + 1])
	let card_element =
		insert_html(card_origin, raw_html_string);
	set_card_data_from_doc(card_element, previous_card_index + 1, main_doc.open_cards)
	unselect_selected_card();
	card_div_element_to_be_moved = card_element;
	set_select_card(card_element,true)
	if(is_animation_on())
	{
	  anime({
		targets: card_element,
		scale: [0.0,1.0],
		easing: 'easeInQuad',
		duration: 500,
	  });
	}
	// leave add mode
	cancel_all_edits()
	//save_doc()  // do not save now - wait for edit end
	// make this directly editable
	set_card_display(card_element,'inline');
	toggle_edit_mode(card_element.getElementsByClassName('edit-button')[0],card_element);
}

function is_animation_on()
{
	return (animation_state == 'Animation on');
}

function animation_changed(element)
{
	console.log("animation_changed: "+element.checked);
	if(element.checked)
	{
		document.getElementById('animation_status_label_id').innerHTML = "Animation on";
		localStorage.setItem("animation_state",'Animation on');
		animation_state = 'Animation on';
	}
	else
	{
		document.getElementById('animation_status_label_id').innerHTML = "Animation off";
		localStorage.setItem("animation_state",'Animation off');
		animation_state = 'Animation off';
	}
}

function cancel_all_edits() {
	close_all_accordions()  // leads to double click on reopen
	let open_cards_view = document.getElementById('open_cards_id')
	set_style_property_for_class_in_children(
		open_cards_view, '.display-on-add-mode',
		'display', 'none')
	set_style_property_for_class_in_children(
		open_cards_view, '.display-on-edit-mode',
		'display', 'none')
	set_style_property_for_class_in_children(
		open_cards_view, '.display-on-move-mode',
		'display', 'none')
	delete_class_in_children(
		open_cards_view, 'c-button--active')
	set_style_property_for_class_in_children(
		open_cards_view, '.unhide-on-edit-mode',
		'visibility', 'hidden')
	set_property_for_class_in_children(
		open_cards_view, '.writeable-on-editmode',
		'readOnly', true)
	set_property_for_class_in_children(
		open_cards_view, '.remove-disabled-on-editmode',
		'disabled', true)
}

function click_add_mode(element) {
	let open_cards_view = document.getElementById('open_cards_id')
	if (element.classList.contains("c-button--active")) {
		// turn add mode off
		element.classList.remove("c-button--active");
		set_style_property_for_class_in_children(
			open_cards_view, '.display-on-add-mode',
			'display', 'none')
	}
	else {
		// turn add mode on
		element.classList.add("c-button--active");
		set_style_property_for_class_in_children(
			open_cards_view, '.display-on-add-mode',
			'display', 'inline')
	}
	close_all_accordions();
}


function click_move(element) {
	console.log('move')
	let card_origin = find_ancestor(element, "card-origin")
	//set_select_card(card_origin, false);
	console.log('behind pos')
	// find index for document in front
	let previous_card_index =
		find_index_for_card(card_origin.open_card,main_doc.open_cards)
	console.log('Moving ' + card_to_be_moved_index + ' behind ' + previous_card_index)
	// move card element
	card_origin.parentNode.insertBefore(
		card_div_element_to_be_moved,
		card_origin.nextSibling);
	// move card in data card
	if(previous_card_index >= main_doc.open_cards.length)
	{
		// add to end
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards.push(
				doc.open_cards.splice(card_to_be_moved_index, 1)[0]
			);
		})
	}
	else
	{
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards.splice(previous_card_index, 0,    // add at new pos
				doc.open_cards.splice(card_to_be_moved_index, 1)[0]);  // delete at old pos
		})
	}
	// leave add mode
	cancel_all_edits()
	save_doc(true)
}

// Parameters saving from preferences.
function save_synch_data() {
	console.log('save_synch_data');
	project_name = document.getElementById('project_name_id').value;
	localStorage.setItem("project_name", project_name);
	// do not mix repositories
	has_connect_once = 'false';
	localStorage.setItem("has_connect_once",has_connect_once);
	document.getElementById('saving_done_indicator_id').style.display = 'inline';
	if(timeout_func_hide_saving_indicator != undefined)
	{
		clearTimeout(timeout_func_hide_saving_indicator);
	}
	var timeout_func_hide_saving_indicator = setTimeout(
		hide_timeout_indicator,2000);
}

function click_card_header(element)
{
	unselect_selected_card();
	let card_origin = find_ancestor(element, "card-origin");
	// check display
	if(card_origin.children[1].style.display != 'none')
	{
		set_card_display(card_origin, 'none');
	}
	else
	{
		// display children > 0
		set_card_display(card_origin, 'inline');
	}
}

function click_edit(element) {
	//find base card div element
	let card_origin = find_ancestor(element, "card-origin");
	toggle_edit_mode(element,card_origin);
}

function toggle_edit_mode(element,card_origin)
{
	if (element.classList.contains("c-button--active")) {
		// turn edit mode off
		element.classList.remove("c-button--active");
		set_style_property_for_class_in_children(
			card_origin, '.unhide-on-edit-mode',
			'visibility', 'hidden')
		set_property_for_class_in_children(
			card_origin, '.writeable-on-editmode',
			'readOnly', true)
		set_property_for_class_in_children(
			card_origin, '.remove-disabled-on-editmode',
			'disabled', true)
		check_data_and_save(card_origin)
	}
	else // turn edit mode on
	{
		element.classList.add("c-button--active");
		set_style_property_for_class_in_children(
			card_origin, '.unhide-on-edit-mode',
			'visibility', 'visible')
		set_property_for_class_in_children(
			card_origin, '.writeable-on-editmode',
			'readOnly', false)
		set_property_for_class_in_children(
			card_origin, '.remove-disabled-on-editmode',
			'disabled', false)
	}
}

function click_move_mode(element) {
	let open_cards_view = document.getElementById('open_cards_id')
	let card_origin = find_ancestor(element, "card-origin");
	card_to_be_moved_index = find_index_for_card(card_origin.open_card,main_doc.open_cards)
	card_div_element_to_be_moved = card_origin
	set_select_card(card_origin,true);
	if (element.classList.contains("c-button--active")) {
		// turn add mode off
		element.classList.remove("c-button--active");
		set_style_property_for_class_in_children(
			open_cards_view, '.display-on-move-mode',
			'display', 'none')
	}
	else {
		// turn add mode on
		element.classList.add("c-button--active");
		set_style_property_for_class_in_children(
			open_cards_view, '.display-on-move-mode',
			'display', 'inline')
	}
	close_all_accordions();
}


//////////////////////////////////////////////////////////////////////////////
////////////////////////////   Card template   ///////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function create_card_html(card) { 
	return ` 
	<div class="c-card card-origin u-high" style="margin-top: 8px;">
	  <div class="c-card__item c-card__item--divider c-card__item--brand"
	  style="cursor: pointer;" onclick="click_card_header(this);">
	  <div class="o-grid o-grid--demo o-grid--no-gutter">
	  		<div class="o-grid__cell o-grid__cell--width-70">
				  <div class="o-grid-text card_header_title">
				  `+ card.title + `  
	  			  </div>
			</div>
			<div class="o-grid__cell">
					<div class="o-grid-text u-right">
						<button type="button" class="c-button display-on-add-mode u-small"
						style="display:none;margin-top:-10px;margin-bottom:-10px;"
						onclick="event.stopPropagation();click_add(this);">
							<i class="material-icons" style="font-size:1em;margin:0;">note_add</i>
							<i class="material-icons" style="font-size:1em;margin:0;">arrow_downward</i>
						</button>
						<button type="button" class="c-button display-on-move-mode u-small"
						style="display:none;margin-top:-10px;margin-bottom:-10px;"
						onclick="event.stopPropagation();click_move(this);">
							<i class="material-icons" style="font-size:1em;margin:0;">swap_vert</i>
							<i class="material-icons" style="font-size:1em;margin:0;">arrow_downward</i>
						</button>
						<button type="button" class="c-button display-on-add-mode display-on-move-mode u-small"
						style="display:none;margin-top:-10px;margin-bottom:-10px;"
						onclick="event.stopPropagation();click_cancel();">
							<i class="material-icons" style="font-size:1em;">
							block
							</i>
						</button>
					</div>
			</div>
		</div>
	  </div>
	  <div class="close_accordion" style="display:none">
        <div class="o-grid o-grid--no-gutter o-grid--demo o-grid--wrap">
			<div class="o-grid__cell o-grid__cell--width-fixed" style="width: '20px'">
			<div class="o-grid-text">
				<select class="c-field point_select">
					<option class="remove-disabled-on-editmode" 
						disabled="disabled">1</option>
					<option class="remove-disabled-on-editmode" 
						disabled="disabled">2</option>
					<option class="remove-disabled-on-editmode" 
						disabled="disabled">3</option>
					<option class="remove-disabled-on-editmode" 
						disabled="disabled" selected>5</option>
					<option class="remove-disabled-on-editmode" 
						disabled="disabled">8</option>
					<option class="remove-disabled-on-editmode" 
						disabled="disabled">13</option>
					<option class="remove-disabled-on-editmode"  
						disabled="disabled">20</option>
					<option class="remove-disabled-on-editmode" 
						disabled="disabled">40</option>
					<option class="remove-disabled-on-editmode" 
						disabled="disabled">100</option>
				</select>
			</div>
			</div>
			<div class="o-grid__cell o-grid__cell--width-fixed  o-grid__cell--center" style="width: '20px'">
			<div class="o-grid-text">
				<i class="material-icons" style="font-size:1em;">rowing</i>
			</div>
			</div>
			<div class="o-grid__cell">
			<div class="o-grid-text u-right">
				<button type="button" class="c-button unhide-on-edit-mode block-on-finishcard"
					style="visibility:hidden" onclick="click_add_mode(this)">
					<i class="material-icons"
					style="font-size:1em;">note_add</i></button>
				<button type="button" class="c-button unhide-on-edit-mode block-on-finishcard"
					style="visibility:hidden" onclick="click_delete(this)"><i 
					class="material-icons" 
					style="font-size:1em;">delete</i></button>
				<button type="button" class="c-button unhide-on-edit-mode block-on-finishcard"
					style="visibility:hidden" onclick="click_move_mode(this)"><i 
					class="material-icons" 
					style="font-size:1em;">swap_vert</i></button>
				<button type="button" class="c-button unhide-on-edit-mode block-on-finishcard"
					style="visibility:hidden" onclick="click_finish(this)">
						<i class="material-icons" 
						style="font-size:1em;">
						assignment_turned_in
					</i>
				</button>
				<button type="button" class="c-button block-on-finishcard edit-button"  
				onclick="click_edit(this)">
					<i class="material-icons" 
						style="font-size:1em;">
						build
					</i>
				</button>
				<button type="button" class="c-button display-on-finishcard"  
				style="display:none" onclick="click_return_to_open(this)">
					<i class="material-icons" 
						style="font-size:1em;">
						assignment_return
					</i>
				</button>
				</div>
			</div>
			<div class="o-grid__cell o-grid__cell--width-100">
				<div class="o-grid-text">
				<textarea class="c-field writeable-on-editmode
				description_input_text"
				placeholder="Description..." readOnly></textarea>
			</div>
			</div>
			<div class="o-grid__cell o-grid__cell--width-100">
				<div class="o-grid-text">
					<div class="o-field o-field--icon-left unhide-on-edit-mode" 
					style="visibility:hidden">
					<i class="material-icons c-icon" 
					style="font-size:1em;">title</i>
					<input class="c-field title_input_text" type="text">
				</div>
			</div>
			</div>
	    </div>
	  </div>
	</div>
	`;
}


//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////   View   ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function update_view_sync_timeout()
{
	document.getElementById('sync_value_view_id').innerHTML = 
	  document.getElementById('sync_value_input_id').value;
}

function sync_timeout_changed()
{
	sync_timeout = document.getElementById('sync_value_input_id').value;
	localStorage.setItem("sync_timeout", sync_timeout);
	console.log('sync_timeout_changed: '+sync_timeout);
}

function set_animation_state(mode)
{
	document.getElementById('animation_status_label_id').innerHTML = mode;
	document.getElementById('animation_checkbox_id').checked = (mode == 'Animation on');
}

function close_all_accordions() 
{
	let all_cards = document.getElementsByClassName('card-origin');
	for(i = 0; i < all_cards.length; i++)
	{
		set_card_display(all_cards[i], 'none');
	}
}

function unselect_selected_card()
{
	if(card_div_element_to_be_moved != undefined)
	{
	  set_select_card(card_div_element_to_be_moved,false);
	}
}

function set_select_card(card_origin,set_select)
{
	if(set_select)
	{
		card_origin.children[0].classList.remove('c-card__item--brand');
		card_origin.children[0].classList.add('c-card__item--warning');
	}
	else
	{
		card_origin.children[0].classList.remove('c-card__item--warning');
		card_origin.children[0].classList.add('c-card__item--brand');
	}
}

function add_synchronize_feedback(user_info) {
	let info_str = '<div>' + user_info + '</div>';
	append_html(document.getElementById('synhronize_step_list_id'), info_str);
}

function hide_timeout_indicator()
{
	document.getElementById('saving_done_indicator_id').style.display = 'none';
}

function set_card_display(card_origin, style_display_value)
{
	// do not display children > 0, 0 is the header
	for(var i = 1; i < card_origin.children.length; i++)
	{
		card_origin.children[i].style.display = style_display_value;
	}
}

function set_card_data_from_doc(card_element, card_index, doc) {
	card_element.querySelector('.title_input_text').value
		= doc[card_index].title
	card_element.querySelector('.description_input_text').value
		= doc[card_index].description
	card_element.querySelector('.point_select').value
		= doc[card_index].points
	// save reference to data in view (it is JS...)
	card_element.open_card = doc[card_index];
}


function update_data_view() {
	let open_cards_view = document.getElementById('open_cards_id');
	while (open_cards_view.firstChild) {
		open_cards_view.removeChild(open_cards_view.firstChild);
	}
	for (i = 0; i < main_doc.open_cards.length; i++) {
		let string_html_data =
			create_card_html(
				main_doc.open_cards[i]
			);
		append_html(open_cards_view, string_html_data);
		let all_card_views = open_cards_view.querySelectorAll('.card-origin')
		let card_element = all_card_views[all_card_views.length - 1]
		set_card_data_from_doc(card_element, i, main_doc.open_cards)
	}
	//open_cards_view.forceUpdate();
	let finished_cards_view = document.getElementById('finished_cards_id');
	while (finished_cards_view.firstChild) {
		finished_cards_view.removeChild(finished_cards_view.firstChild);
	}
	for (i = 0; i < main_doc.finished_cards.length; i++) {
		let string_html_data =
			create_card_html(
				main_doc.finished_cards[i]
			);
		append_html(finished_cards_view, string_html_data);
		let all_card_views = finished_cards_view.querySelectorAll('.card-origin')
		let card_element = all_card_views[all_card_views.length - 1]
		set_card_data_from_doc(card_element, i, main_doc.finished_cards)
	}
}


//////////////////////////////////////////////////////////////////////////////
///////////////////////////////   Open page   ////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function show_help() {
	unselect_selected_card();
	hide_all_pages();
	let page = document.getElementById('help_id');
	animate_page(page);
	page.style.display = 'inline';
}

function show_prefences() {
	unselect_selected_card();
	hide_all_pages();
	let page = document.getElementById('preferences_id');
	animate_page(page);
	page.style.display = 'inline';
}

function show_chart() {
	unselect_selected_card();
	hide_all_pages();
	let page = document.getElementById('burndown_chart');
	page.style.display = 'inline';
	drawChart();
	animate_page(page);
}

function show_open_cards() {
	unselect_selected_card();
	console.log('show_open_cards');
	hide_all_pages();
	let open_cards_view = document.getElementById('open_cards_id');
	set_style_property_for_class_in_children(
		open_cards_view, '.block-on-finishcard',
		'display', 'inline')
	set_style_property_for_class_in_children(
		open_cards_view, '.display-on-finishcard',
		'display', 'none')
	animate_page(open_cards_view);
	open_cards_view.style.display = 'inline';
}

function show_finished_cards() {
	unselect_selected_card();
	console.log('show_finished_cards')
	hide_all_pages()
	let finished_cards_view = document.getElementById('finished_cards_id')
	finished_cards_view.style.display = 'inline';
	animate_page(finished_cards_view);
	finished_cards_view.style.display = 'inline';

	set_style_property_for_class_in_children(
		finished_cards_view, '.block-on-finishcard',
		'display', 'none')
	set_style_property_for_class_in_children(
		finished_cards_view, '.display-on-finishcard',
		'display', 'inline')
}

function drawChart() {

	let data_array = [];
	data_array[0] = ['Date', 'Points'];
	var open_points = 0; // the chart's offset

	// go through all open cards and add up points
	for (i = 0; i < main_doc.open_cards.length; i++) {
		open_points += main_doc.open_cards[i].points;
	}
	let finished_points = 0;
	// go through finished and calculate finished value
	for (i = main_doc.finished_cards.length - 1; i >= 0; i--) {
		data_array[i + 2] = [new Date(main_doc.finished_cards[i].date_finished),
		open_points + finished_points];
		finished_points += main_doc.finished_cards[i].points;
	}

	// add first element with full points
	data_array[1] = [new Date(main_doc.finished_cards[0].date_added),
	open_points + finished_points];

	var data = google.visualization.arrayToDataTable(
		data_array
	);
	

	var options = {
		title: 'Burndown chart',
		//curveType: 'function',
		legend: { position: 'bottom' },
		height: window.innerHeight * 3 / 4,
		width: document.getElementById('burndown_chart').parentElement.offsetWidth,
		vAxis: { minValue: 0 }, // force y=0 in view
	};

	if(is_animation_on())
	{
		options.animation = {"startup": true, duration: 700 };
	}

	var chart = new google.visualization.LineChart(document.getElementById('burndown_chart'));

	chart.draw(data, options);
}

function hide_all_pages() {
	document.getElementById('open_cards_id').style.display = 'none';
	document.getElementById('finished_cards_id').style.display = 'none';
	document.getElementById('burndown_chart').style.display = 'none';
	document.getElementById('preferences_id').style.display = 'none';
	document.getElementById('synhronize_id').style.display = 'none';
	document.getElementById('help_id').style.display = 'none';
}

function animate_page(page)
{
	if(is_animation_on())
	{
		page.style.opacity = "0.0"
		anime({
			targets: page,
			opacity: 1.0,
			duration: 2000,
		  });
	}
}

//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////   Utility   ////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};


/// Returns the newly created card div element
function append_html(el, str) {
	var div = document.createElement('div');
	let result
	div.innerHTML = str;
	while (div.children.length > 0) {
		if (div.children[div.children.length - 1].classList.contains('card-origin')) {
			result = div.children[div.children.length - 1]
		}
		el.appendChild(div.children[0]);
	}
	return result
}


/// Returns the newly created card div element
// inserts new elements from raw html string after el
function insert_html(el, str) {
	let div = document.createElement('div');
	let result;
	div.innerHTML = str;
	while (div.children.length > 0) {
		if (div.children[div.children.length - 1].classList.contains('card-origin')) {
			result = div.children[div.children.length - 1]
		}
		insert_after(div.children[div.children.length - 1], el);
	}
	return result
}

function insert_after(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function find_ancestor(el, cls) {
	while ((el = el.parentElement) && !el.classList.contains(cls));
	return el;
}

function clear_children(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

function set_display_on_all_children(element, display_style)
{
	for(var i = 0; i < element.children.length; i++)
	{
		element.children[i].style.display = display_style;
	}
}

function set_style_property_for_class_in_children(parentelem, classname,
	property, value) {
	let list = parentelem.querySelectorAll(classname);
	for (var i = 0; i < list.length; i++) {
		list[i].style[property] = value;
	}
}

function set_property_for_class_in_children(parentelem, classname,
	property, value) {
	let list = parentelem.querySelectorAll(classname);
	for (var i = 0; i < list.length; i++) {
		list[i][property] = value;
	}
}

function delete_class_in_children(
	parentelem, classname) {
	let list = parentelem.querySelectorAll('.' + classname)
	for (i = 0; i < list.length; i++) {
		list[i].classList.remove(classname)
	}
}

function add_or_delete_property_for_class_in_children(
	parentelem, classname, property, add) {
	let list = parentelem.querySelectorAll(classname);
	for (var i = 0; i < list.length; i++) {
		if (add) {
			list[i][property] = '';
		}
		else {
			delete list[i][property];
		}
	}
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////   Main   //////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function init_data() {
	main_doc = Automerge.init();
	let serialData =
		localStorage.getItem("SerializedAutomergeData");
	user_group_name = localStorage.getItem("user_group_name");
	project_name = localStorage.getItem("project_name");
	if(project_name == null)
	{
		project_name = "Unnamed_project";
	}
	access_token = localStorage.getItem("access_token");
	has_connect_once = localStorage.getItem("has_connect_once");
	if(has_connect_once == undefined)
	{
		has_connect_once = 'false';
	}
	num_entries = localStorage.getItem("num_entries");
	if(num_entries == undefined)
	{
		num_entries = -1;
	}
	console.log("num_entries: "+num_entries);
	local_changes = localStorage.getItem("local_changes");
	if(local_changes == undefined)
	{
		local_changes = 'false';
	}
	console.log("local_changes: "+local_changes);
	animation_state = localStorage.getItem("animation_state");
	if(animation_state == undefined)
	{
		animation_state = 'Animation off';
	}
	set_animation_state(animation_state);
	if (project_name)
		document.getElementById('project_name_id').value = project_name;
	document.getElementById('file-input').onchange = function() {
			// fire the upload here
			console.log("file selected");
			upload_selected_file( document.getElementById('file-input').files[0], false );
		};
		document.getElementById('file-input-merge').onchange = function() {
			// fire the upload here
			console.log("file selected");
			upload_selected_file( document.getElementById('file-input-merge').files[0], true );
		};
	if (serialData == undefined) {
		console.log("Created new doc");

		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards = [],
				doc.finished_cards = []
		})

		// Initial data
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards.push
				({
					title: 'Click me', description: '',
					date_added: Date.now() - 1000 * 60 * 10,
					date_finished: 0,
					points: 2
				})
			doc.finished_cards.push
				({
					title: 'Finished', description: '',
					date_added: Date.now() - 1000 * 60 * 10,
					date_finished: Date.now(),
					points: 1
				})
		})

		save_doc(false)
	}
	else // Load from storage
	{
		console.log("Loaded from storage");
		main_doc = Automerge.load(LZString.decompressFromUTF16(serialData));
	}
	console.log("init_data done");
}

document.addEventListener("DOMContentLoaded", function (event) {
	init_data();
	update_data_view();
	google.charts.load('current', { packages: ['corechart'] });
	//google.charts.setOnLoadCallback(drawChart);
});