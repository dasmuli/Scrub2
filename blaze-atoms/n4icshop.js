/*! Built with http://stenciljs.com */
const{h:t}=window.BlazeAtoms;class e{constructor(){this.height=0}render(){return t("div",{class:"o-panel-container",style:{height:`${this.height}px`}},t("div",{class:"o-panel"},t("slot",null)))}static get is(){return"blaze-panel"}static get properties(){return{height:{type:Number,attr:"height"}}}}export{e as BlazePanel};