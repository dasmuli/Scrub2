/*! Built with http://stenciljs.com */
BlazeAtoms.loadBundle("75yr1ari",["exports"],function(e){var t=window.BlazeAtoms.h,o=function(){function e(){this.ghost=!1,this.full=!1,this.open=!1,this.dismissible=!1,this._isOpen=!1}return e.prototype.close=function(){this._isOpen=!1},e.prototype.show=function(){this._isOpen=!0},e.prototype.isOpen=function(){return this._isOpen},e.prototype.componentWillLoad=function(){this._isOpen=this.open},e.prototype.dismiss=function(){this.dismissible&&this.close()},e.prototype.render=function(){var e=this,o=this.ghost?"o-modal--ghost":"",i=this.full?"o-modal--full":"",s=this._isOpen?"":"u-display-none",n=this.dismissible?"c-overlay--dismissible":"";return[this._isOpen&&t("div",{class:"c-overlay c-overlay--visible "+n,onClick:function(){return e.dismiss()}}),t("div",{class:"o-modal "+o+" "+i+" "+s},this.dismissible&&t("button",{type:"button",class:"c-button c-button--close",onClick:function(){return e.close()}},"×"),t("slot",null))]},Object.defineProperty(e,"is",{get:function(){return"blaze-modal"},enumerable:!0,configurable:!0}),Object.defineProperty(e,"properties",{get:function(){return{_isOpen:{state:!0},close:{method:!0},dismissible:{type:Boolean,attr:"dismissible"},elem:{elementRef:!0},full:{type:Boolean,attr:"full"},ghost:{type:Boolean,attr:"ghost"},isOpen:{method:!0},open:{type:Boolean,attr:"open"},show:{method:!0}}},enumerable:!0,configurable:!0}),e}();e.BlazeModal=o,Object.defineProperty(e,"__esModule",{value:!0})});