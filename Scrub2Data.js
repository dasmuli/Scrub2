
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
		  doc.open_cards.push({title: 'Click me', description: 'Add description...',done: false, date_added:'now', date_finished:'later',points:'0'})
		})
		
		/* massive data test */
		for(i = 0; i< 10; i++)
		{
			main_doc = Automerge.change(main_doc, 'Add card', doc => {
			  doc.open_cards.push({title: 'Doc'+i, done: false})
			})
		}
		
		serialData = Automerge.save(main_doc);
		
		localStorage.setItem("SerializedAutomergeData", serialData);
	}
	else
	{
		console.log("Loaded from storage");
		main_doc = Automerge.load(serialData);
	}
	console.log("init_data done");
}

function create_card_html(card)
{
	return `
	<blaze-accordion-pane header="`+card.title+`">
   <div class="o-grid o-grid--no-gutter o-grid--demo o-grid--wrap">
	<div class="o-grid__cell o-grid__cell--width-fixed" style={{width: '20px'}}>
	 <div class="o-grid-text">
	   <select class="c-field">
		  <option>1</option>
		  <option>2</option>
		  <option>3</option>
		  <option>5</option>
		  <option>8</option>
		  <option>13</option>
		  <option>20</option>
		  <option>40</option>
		  <option>100</option>
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
		<button type="button" class="c-button"><i class="material-icons" style="font-size:1em;">note_add</i></button>
		<button type="button" class="c-button"><i class="material-icons" style="font-size:1em;">delete</i></button>
		<button type="button" class="c-button"><i class="material-icons" style="font-size:1em;">swap_vert</i></button>
		<button type="button" class="c-button"><i class="material-icons" style="font-size:1em;">assignment_turned_in</i></button>
		<button type="button" class="c-button"><i class="material-icons" style="font-size:1em;">save</i></button>
		<!--
		<button type="button" class="c-button"><i class="material-icons" style="font-size:1em;">build</i></button>
		-->
    </div>
  </div>
  <div class="o-grid__cell o-grid__cell--width-100">
    <div class="o-grid-text">
	  <textarea class="c-field" placeholder="Type in here..."></textarea>
	</div>
  </div>
  <div class="o-grid__cell o-grid__cell--width-100">
    <div class="o-grid-text">
      <div class="o-field o-field--icon-left">
	    <i class="material-icons c-icon" style="font-size:1em;">title</i>
	    <input class="c-field" type="text">
	  </div>
	</div>
  </div>
</div>
  </blaze-accordion-pane>
	`;
}

function append_html(el, str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  while (div.children.length > 0) {
    el.appendChild(div.children[0]);
  }
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
	}
}

document.addEventListener("DOMContentLoaded", function(event) { 
  init_data();
  update_data_view();
});