/*! Built with http://stenciljs.com */
BlazeAtoms.loadBundle("hfe759qg",["exports"],function(e){var t=window.BlazeAtoms.h,n=function(){function e(){this.dismissible=!1,this.open=!1,this._isOpen=!1}return e.prototype.close=function(){this._isOpen=!1},e.prototype.show=function(){this._isOpen=!0},e.prototype.isOpen=function(){return this._isOpen},e.prototype.componentWillLoad=function(){this._isOpen=this.open},e.prototype.render=function(){var e=this,n=this._isOpen?"":"u-display-none";return t("div",{class:"c-alert c-alert--"+this.type+" "+n},this.dismissible&&t("button",{class:"c-button c-button--close",onClick:function(){return e.close()}},"×"),t("slot",null))},Object.defineProperty(e,"is",{get:function(){return"blaze-alert"},enumerable:!0,configurable:!0}),Object.defineProperty(e,"properties",{get:function(){return{_isOpen:{state:!0},close:{method:!0},dismissible:{type:Boolean,attr:"dismissible"},isOpen:{method:!0},open:{type:Boolean,attr:"open"},show:{method:!0},type:{type:String,attr:"type"}}},enumerable:!0,configurable:!0}),e}();e.BlazeAlert=n,Object.defineProperty(e,"__esModule",{value:!0})});