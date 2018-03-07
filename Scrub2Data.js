
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
		  doc.cards = [],
		  doc.finished_cards = []
		})
		
		main_doc = Automerge.change(main_doc, 'Add card', doc => {
		  doc.cards.push({title: 'Test title', description: 'Test description',done: false, date_added:'now', date_finished:'later'})
		})
		
		/* massive data test */
		for(i = 0; i< 1000; i++)
		{
			main_doc = Automerge.change(main_doc, 'Add card', doc => {
			  doc.cards.push({title: 'Doc'+i, done: false})
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

function update_data_view()
{
	document.getElementById('main_data').append("Data inc");
	for(i = 0; i < main_doc.cards.length; i++)
	{
		var innerDiv = document.createElement('div');
		innerDiv.innerHTML = main_doc.cards[i].title;
		// The variable iDiv is still good... Just append to it.
		 document.getElementById('main_data').appendChild(innerDiv);
	}
}

document.addEventListener("DOMContentLoaded", function(event) { 
  init_data();
  update_data_view();
});