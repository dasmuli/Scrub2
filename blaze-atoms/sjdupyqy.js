/*! Built with http://stenciljs.com */
const{h:t}=window.BlazeAtoms;class e{constructor(){this.filter=""}generateSrc(){if(this.src)return this.src;let t="";this.width&&this.height&&(t=`${this.width}x${this.height}/`);let e="";return this.filter&&(e=`?${this.filter}`),this.photo?`https://source.unsplash.com/${this.photo}/${t}`:this.user?this.likes?`https://source.unsplash.com/user/${this.user}/likes/${t}${e}`:`https://source.unsplash.com/user/${this.user}/${t}${e}`:this.collection?`https://source.unsplash.com/collection/${this.collection}/${t}${e}`:`https://source.unsplash.com/random/${t}${e}`}render(){const e=this.generateSrc();return t("img",{class:"o-image",src:e,alt:this.alt})}static get is(){return"blaze-image"}static get properties(){return{alt:{type:String,attr:"alt"},collection:{type:String,attr:"collection"},filter:{type:String,attr:"filter"},height:{type:Number,attr:"height"},likes:{type:Boolean,attr:"likes"},photo:{type:String,attr:"photo"},src:{type:String,attr:"src"},user:{type:String,attr:"user"},width:{type:Number,attr:"width"}}}}export{e as BlazeImage};