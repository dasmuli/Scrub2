/*! Built with http://stenciljs.com */
BlazeAtoms.loadBundle("oxc4qjqy",["exports"],function(e){var t=window.BlazeAtoms.h,n=function(){function e(){this.page=1,this.pages=1}return e.prototype.goToPage=function(e){e>0&&e<=this.pages&&(this._currentPage=e,this.onPageChange.emit(this._currentPage))},e.prototype.currentPage=function(){return this._currentPage},e.prototype.componentWillLoad=function(){this._currentPage=this.page},e.prototype.render=function(){var e=this;return t("div",{class:"c-pagination"},t("div",{class:"c-pagination__controls c-pagination__controls--backward"},t("button",{class:"c-pagination__control",onClick:function(){return e.goToPage(1)},disabled:1===this._currentPage},"«"),t("button",{class:"c-pagination__control",onClick:function(){return e.goToPage(e._currentPage-1)},disabled:1===this._currentPage},"‹")),t("div",{class:"c-pagination__controls"},this._currentPage>1&&t("span",{class:"c-pagination__ellipsis"},"…"),this._currentPage>1&&t("button",{onClick:function(){return e.goToPage(e._currentPage-1)},class:"c-pagination__page"},this._currentPage-1),t("button",{class:"c-pagination__page c-pagination__page--current"},this._currentPage),this._currentPage<this.pages&&t("button",{onClick:function(){return e.goToPage(e._currentPage+1)},class:"c-pagination__page"},this._currentPage+1),this._currentPage<this.pages&&t("span",{class:"c-pagination__ellipsis"},"…")),t("div",{class:"c-pagination__controls c-pagination__controls--forward"},t("button",{class:"c-pagination__control",onClick:function(){return e.goToPage(e._currentPage+1)},disabled:this._currentPage===this.pages},"›"),t("button",{class:"c-pagination__control",onClick:function(){return e.goToPage(e.pages)},disabled:this._currentPage===this.pages},"»")))},Object.defineProperty(e,"is",{get:function(){return"blaze-pagination"},enumerable:!0,configurable:!0}),Object.defineProperty(e,"properties",{get:function(){return{_currentPage:{state:!0},currentPage:{method:!0},goToPage:{method:!0},page:{type:Number,attr:"page"},pages:{type:Number,attr:"pages"}}},enumerable:!0,configurable:!0}),Object.defineProperty(e,"events",{get:function(){return[{name:"onPageChange",method:"onPageChange",bubbles:!0,cancelable:!0,composed:!0}]},enumerable:!0,configurable:!0}),e}();e.BlazePagination=n,Object.defineProperty(e,"__esModule",{value:!0})});