
var main_doc;

function init_data()
{
	main_doc = Automerge.init();
	let serialData =
		localStorage.getItem("SerializedAutomergeData");
	if(true/*serialData == undefined*/)
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

function create_card_html()
{
	return `
	<blaze-accordion-pane header=\"Click meee also\">
	  To toggle other panes
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
	let main_data_el = document.getElementById('open_cards_id');
	let string_html_data = create_card_html();
	append_html(main_data_el, string_html_data);
	document.getElementById('main_data').append("Data inc");
	for(i = 0; i < main_doc.open_cards.length; i++)
	{
		var innerDiv = document.createElement('div');
		innerDiv.innerHTML = main_doc.open_cards[i].title;
		// The variable iDiv is still good... Just append to it.
		 document.getElementById('main_data').appendChild(innerDiv);
	}
}

document.addEventListener("DOMContentLoaded", function(event) { 
  init_data();
  update_data_view();
});