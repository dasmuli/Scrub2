/*! Built with http://stenciljs.com */
const{h:t}=window.BlazeAtoms;class a{constructor(){this.page=1,this.pages=1}goToPage(t){t>0&&t<=this.pages&&(this._currentPage=t,this.onPageChange.emit(this._currentPage))}currentPage(){return this._currentPage}componentWillLoad(){this._currentPage=this.page}render(){return t("div",{class:"c-pagination"},t("div",{class:"c-pagination__controls c-pagination__controls--backward"},t("button",{class:"c-pagination__control",onClick:()=>this.goToPage(1),disabled:1===this._currentPage},"«"),t("button",{class:"c-pagination__control",onClick:()=>this.goToPage(this._currentPage-1),disabled:1===this._currentPage},"‹")),t("div",{class:"c-pagination__controls"},this._currentPage>1&&t("span",{class:"c-pagination__ellipsis"},"…"),this._currentPage>1&&t("button",{onClick:()=>this.goToPage(this._currentPage-1),class:"c-pagination__page"},this._currentPage-1),t("button",{class:"c-pagination__page c-pagination__page--current"},this._currentPage),this._currentPage<this.pages&&t("button",{onClick:()=>this.goToPage(this._currentPage+1),class:"c-pagination__page"},this._currentPage+1),this._currentPage<this.pages&&t("span",{class:"c-pagination__ellipsis"},"…")),t("div",{class:"c-pagination__controls c-pagination__controls--forward"},t("button",{class:"c-pagination__control",onClick:()=>this.goToPage(this._currentPage+1),disabled:this._currentPage===this.pages},"›"),t("button",{class:"c-pagination__control",onClick:()=>this.goToPage(this.pages),disabled:this._currentPage===this.pages},"»")))}static get is(){return"blaze-pagination"}static get properties(){return{_currentPage:{state:!0},currentPage:{method:!0},goToPage:{method:!0},page:{type:Number,attr:"page"},pages:{type:Number,attr:"pages"}}}static get events(){return[{name:"onPageChange",method:"onPageChange",bubbles:!0,cancelable:!0,composed:!0}]}}export{a as BlazePagination};