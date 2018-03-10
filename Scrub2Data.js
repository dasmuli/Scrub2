
var main_doc;

function init_data()
{
	main_doc = Automerge.init();
	let serialData =
		localStorage.getItem("SerializedAutomergeData");
	if(serialData == undefined)
	{
		console.log("Created new doc");

		main_doc = Automerge.change(main_doc, 'Initialize card list', doc => {
		  doc.open_cards = [],
		  doc.finished_cards = []
		})
		
		// Initial data
		main_doc = Automerge.change(main_doc, 'Add card', doc => {
			doc.open_cards.push
			({title: 'Click me', description: '', date_added:'now', date_finished:'later',points:'0'})
		})
		
		save_doc()
	}
	else // Load from storage
	{
		console.log("Loaded from storage");
		main_doc = Automerge.load(serialData);
	}
	console.log("init_data done");
}

function save_doc()
{
	let serialData = Automerge.save(main_doc);
	localStorage.setItem("SerializedAutomergeData", serialData);
}

function set_style_property_for_class_in_children(parentelem,classname,
											property,value)
{
	let list = parentelem.querySelectorAll(classname);
	for(var i = 0; i <list.length; i++)
	{
		list[i].style[property] = value;
	}
}

function set_property_for_class_in_children(parentelem,classname,
											property,value)
{
	let list = parentelem.querySelectorAll(classname);
	for(var i = 0; i <list.length; i++)
	{
		list[i][property] = value;
	}
}

function delete_class_in_children(
	parentelem,classname)
{
	let list = parentelem.querySelectorAll('.'+classname)
	for(i = 0; i <list.length; i++)
	{
		list[i].classList.remove(classname)
	}
}

function add_or_delete_property_for_class_in_children(
    parentelem,classname,property,add)
{
	let list = parentelem.querySelectorAll(classname);
	for(var i = 0; i <list.length; i++)
	{
		if(add)
		{
		  list[i][property] = '';
		}
		else
		{
		  delete list[i][property];
		}
	}
}

function find_index_for_card(open_card)
{
	for(i = 0; i < main_doc.open_cards.length;i++)
	{
		if(main_doc.open_cards[i]._objectId == open_card._objectId)
			return i
	}
	return undefined
}

function check_data_and_save(card_origin)
{
	let changed = false
	let card_index = find_index_for_card(card_origin.open_card)
	if(card_index == undefined)
	{
		console.log("Could not find card index for card "
			+card_origin)
		return
	}
	let title_input = card_origin.querySelector('.title_input_text')
	let description_input = card_origin.querySelector('.description_input_text')
	let point_select = card_origin.querySelector('.point_select')
	// check titlechanged
	if(title_input.value
		 != card_origin.open_card.title)
	{
		console.log("Title changed")
		changed = true;
		main_doc = Automerge.change(main_doc, doc => {
		  doc.open_cards[card_index].title = title_input.value
		})
		card_origin.header = title_input.value
	}
	// check titlechanged
	if(description_input.value
		!= card_origin.open_card.description)
	{
		console.log("Description changed")
		changed = true;
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards[card_index].description 
				= description_input.value
		})
	}
  // check points
	if(point_select.value
		!= card_origin.open_card.points)
	{
		console.log("Points changed")
		changed = true;
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards[card_index].points 
				= point_select.value
		})
	}
	if(changed)
	{
		save_doc()
		card_origin.open_card = main_doc.open_cards[card_index]
	}
}

function on_click_add(element)
{
	console.log('add')
	let position_selector = find_ancestor(element,"card_position_selector")
	if(position_selector.previousElementSibling)
	{
		console.log('behind pos')
		let card_view_before_position = 
			position_selector.previousElementSibling
		// find index for document in front
		let previous_card_index = 
		  find_index_for_card(card_view_before_position.open_card)
		// generate new card
		main_doc = Automerge.change(main_doc, doc => {
			doc.open_cards.insertAt(previous_card_index+1,
				{title: 'Click me', description: '', date_added:'now', date_finished:'later',points:'0'})
		})
		// add html
		let raw_html_string = 
			 create_card_html(main_doc.open_cards[previous_card_index+1])
		let card_element =
		 insert_html(position_selector, raw_html_string);
		set_card_data_from_doc(card_element,previous_card_index+1)
		// leave add mode
		cancel_all_edits()
		// save()
	}
	else // front position
	{
		console.log('front pos')
	}
}

function cancel_all_edits()
{
	let open_cards_view = document.getElementById('open_cards_id')
	set_style_property_for_class_in_children(
		open_cards_view,'.display-on-add-mode',
		'display','none')
	set_style_property_for_class_in_children(
		open_cards_view,'.display-on-edit-mode',
		'display','none')
	delete_class_in_children(
		open_cards_view,'c-button--active')
	set_style_property_for_class_in_children(
		open_cards_view,'.unhide-on-edit-mode',
		'visibility','hidden')
	set_property_for_class_in_children(
		open_cards_view,'.writeable-on-editmode',
		'readOnly',true)
	set_property_for_class_in_children(
		open_cards_view,'.remove-disabled-on-editmode',
		'disabled',true)
}

function on_click_add_mode(element)
{
	let open_cards_view = document.getElementById('open_cards_id')
  if(element.classList.contains("c-button--active"))
	{
		// turn add mode off
		element.classList.remove("c-button--active");
		set_style_property_for_class_in_children(
			open_cards_view,'.display-on-add-mode',
			'display','none')
	}
	else
	{
		// turn add mode on
		element.classList.add("c-button--active");
		set_style_property_for_class_in_children(
			open_cards_view,'.display-on-add-mode',
			'display','inline')
	}
	element.scrollIntoView()
}

function on_click_edit(element)
{
	//find base card div element
	let card_origin = find_ancestor(element,"card-origin");
	if(element.classList.contains("c-button--active"))
	{
		// turn edit mode off
		element.classList.remove("c-button--active");
		set_style_property_for_class_in_children(
		 card_origin,'.unhide-on-edit-mode',
		 'visibility','hidden')
		set_property_for_class_in_children(
		 card_origin,'.writeable-on-editmode',
		 'readOnly',true)
		 set_property_for_class_in_children(
		 card_origin,'.remove-disabled-on-editmode',
		 'disabled',true)
		 check_data_and_save(card_origin)
	}
	else // turn edit mode on
	{
		element.classList.add("c-button--active");
		set_style_property_for_class_in_children(
		 card_origin,'.unhide-on-edit-mode',
		 'visibility','visible')
		set_property_for_class_in_children(
		 card_origin,'.writeable-on-editmode',
		 'readOnly',false)
		set_property_for_class_in_children(
		 card_origin,'.remove-disabled-on-editmode',
		 'disabled',false)
		}
}

function create_card_html(card)
{
	return `
	<blaze-accordion-pane header="`+card.title+`" class="card-origin">
   <div class="o-grid o-grid--no-gutter o-grid--demo o-grid--wrap">
	<div class="o-grid__cell o-grid__cell--width-fixed" style={{width: '20px'}}>
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
   <div class="o-grid__cell o-grid__cell--width-fixed  o-grid__cell--center" style={{width: '20px'}}>
	 <div class="o-grid-text">
	   <i class="material-icons" style="font-size:1em;">rowing</i>
	 </div>
	</div>
  <div class="o-grid__cell">
	<div class="o-grid-text u-right">
		<button type="button" class="c-button unhide-on-edit-mode"
			style="visibility:hidden" onclick="on_click_add_mode(this)">
			<i class="material-icons"
		  style="font-size:1em;">note_add</i></button>
		<button type="button" class="c-button unhide-on-edit-mode"
		  style="visibility:hidden"><i 
		  class="material-icons" 
		  style="font-size:1em;">delete</i></button>
		<button type="button" class="c-button unhide-on-edit-mode"
		  style="visibility:hidden"><i 
		  class="material-icons" 
		  style="font-size:1em;">swap_vert</i></button>
		<button type="button" class="c-button unhide-on-edit-mode"
		  style="visibility:hidden">
		    <i class="material-icons" 
		    style="font-size:1em;">
		     assignment_turned_in
		   </i>
		</button>
		<button type="button" class="c-button"  
		 onclick="on_click_edit(this)">
		  <i class="material-icons" 
		    style="font-size:1em;">
		    build
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
	</blaze-accordion-pane>

<div class="o-grid o-grid--demo o-grid--no-gutter card_position_selector">
  <div class="o-grid__cell o-grid__cell--width-20">
		<div class="o-grid-text">
			<button type="button" class="c-button display-on-add-mode"
			style="display:none" onclick="on_click_add(this)">
				<i class="material-icons" style="font-size:1em;">note_add</i>
				<i class="material-icons" style="font-size:1em;">subdirectory_arrow_right</i>
			</button>
		</div>
  </div>
  <div class="o-grid__cell o-grid__cell--width-20 o-grid__cell--offset-60">
		<div class="o-grid-text u-right">
			<button type="button" class="c-button display-on-add-mode"
			style="display:none" onclick="cancel_all_edits()">
				<i class="material-icons" style="font-size:1em;">
				  block
				</i>
			</button>
		</div>
  </div>
</div>
	`;
}

/// Returns the newly created card div element
function append_html(el, str) {
	var div = document.createElement('div');
	let result
  div.innerHTML = str;
	while (div.children.length > 0)
	{
		if(div.children[div.children.length-1].classList.contains('card-origin'))
		{
			result = div.children[div.children.length-1]
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
	while (div.children.length > 0)
	{
		if(div.children[div.children.length-1].classList.contains('card-origin'))
		{
			result = div.children[div.children.length-1]
		}
		insert_after(div.children[div.children.length-1],el);
	}
	return result
}

function insert_after(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function find_ancestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

function set_card_data_from_doc(card_element,card_index)
{
	card_element.querySelector('.title_input_text').value 
			= main_doc.open_cards[card_index].title
	card_element.querySelector('.description_input_text').value 
		= main_doc.open_cards[card_index].description
	card_element.querySelector('.point_select').value 
		= main_doc.open_cards[card_index].points
	// save reference to data in view (it is JS...)
	card_element.open_card = main_doc.open_cards[card_index];
}

function update_data_view()
{
	let open_cards_view = document.getElementById('open_cards_id');
	for(i = 0; i < main_doc.open_cards.length; i++)
	{
		let string_html_data = 
		  create_card_html(
		    main_doc.open_cards[i]
			);
		append_html(open_cards_view, string_html_data);
		let all_card_views =  open_cards_view.querySelectorAll('.card-origin')
		let card_element = all_card_views[all_card_views.length-1]
		set_card_data_from_doc(card_element,i)
		/*
		card_element.querySelector('.title_input_text').value 
			= main_doc.open_cards[i].title
	  card_element.querySelector('.description_input_text').value 
			= main_doc.open_cards[i].description
		card_element.querySelector('.point_select').value 
			= main_doc.open_cards[i].points
		// save reference to data in view (it is JS...)
		card_element.open_card = main_doc.open_cards[i];
		*/
	}
}

document.addEventListener("DOMContentLoaded", function(event) { 
  init_data();
  update_data_view();
});