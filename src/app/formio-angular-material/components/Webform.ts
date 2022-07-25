//@ts-ignore
import Webform from 'formiojs/Webform.js';
Webform.prototype.redraw = function() {
  return this.render2();
  //return this.render();
};
Webform.prototype.clear = function() {
  const viewContainer = this.viewContainer ? this.viewContainer() : null;
  if (viewContainer) {
    viewContainer.clear();
  }
};
Webform.prototype.render = function() {
  if (this.viewContainer && this.viewContainer()) {
    this.clear();
    this.renderComponents();
    this.setValue(this._submission);
  }
};

Webform.prototype.render2 = function() {
  if (this.viewContainer && this.viewContainer()) {

    this.clear();
    this.renderComponents();
    submissionData = JSON.parse(JSON.stringify(this._submission))
    this.setValue(this._submission);
    setTimeout(()=>{
      this.changeVisibility(null)
    },200)

  }
};
let submissionData:any = {}
Webform.prototype.setFullValue  = function(){
  Object.assign(submissionData.data,JSON.parse(JSON.stringify(this._submission.data)))
  this.setValue(JSON.parse(JSON.stringify(submissionData)));
    //this.renderComponents();
  //this.setDefaultValue(JSON.parse(JSON.stringify(submissionData)));
  //this.updateValue(JSON.parse(JSON.stringify(submissionData)));
}


let submit = Webform.prototype.submitForm;
Webform.prototype.submitForm2 = submit;

Webform.prototype.submitForm = async function(){
  let ret = await this.submitForm2()
  if(ret.submission){
    this.setFullValue()
    return Promise.resolve({
      submission: submissionData,
      saved: true
    })
  }else{
    return Promise.reject(ret)
  }
}

Webform.prototype.changeVisibility = function(instance:any){
  if(this.components&&this.components.length>0){
    this.components.forEach((component:any)=>{
      if(component.materialComponent){
        component.materialComponent.updateVisibility(instance);
      }
    })
  }
}
