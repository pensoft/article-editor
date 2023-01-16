import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
const hexToDecimal = hex => parseInt(hex, 16);
@Component({
  selector: 'app-insert-special-symbol-dialog',
  templateUrl: './insert-special-symbol-dialog.component.html',
  styleUrls: ['./insert-special-symbol-dialog.component.scss']
})
export class InsertSpecialSymbolDialogComponent implements OnInit, AfterViewInit {

  size: number[] = Array.from({length: 50}, (_, i) => i + 1);
  selectOptions: {from:string,to:string,name: string}[] =[
    {from:"0000",to:"007F",name: "Basic Latin"},
    {from:"0080",to:"00FF",name: "Latin-1 Supplement"},
    {from:"0100",to:"017F",name: "Latin Extended-A"},
    {from:"0180",to:"024F",name: "Latin Extended-B"},
    {from:"0250",to:"02AF",name: "IPA Extensions"},
    {from:"02B0",to:"02FF",name: "Spacing Modifier Letters"},
    {from:"0300",to:"036F",name: "Combining Diacritical Marks"},
    {from:"0370",to:"03FF",name: "Greek and Coptic"},
    {from:"0400",to:"04FF",name: "Cyrillic"},
    {from:"0500",to:"052F",name: "Cyrillic Supplement"},
    {from:"0530",to:"058F",name: "Armenian"},
    {from:"0590",to:"05FF",name: "Hebrew"},
    {from:"0600",to:"06FF",name: "Arabic"},
    {from:"0700",to:"074F",name: "Syriac"},
    {from:"0750",to:"077F",name: "Arabic Supplement"},
    {from:"0780",to:"07BF",name: "Thaana"},
    {from:"07C0",to:"07FF",name: "NKo"},
    {from:"0800",to:"083F",name: "Samaritan"},
    {from:"0840",to:"085F",name: "Mandaic"},
    {from:"0860",to:"086F",name: "Syriac Supplement"},
    {from:"08A0",to:"08FF",name: "Arabic Extended-A"},
    {from:"0900",to:"097F",name: "Devanagari"},
    {from:"0980",to:"09FF",name: "Bengali"},
    {from:"0A00",to:"0A7F",name: "Gurmukhi"},
    {from:"0A80",to:"0AFF",name: "Gujarati"},
    {from:"0B00",to:"0B7F",name: "Oriya"},
    {from:"0B80",to:"0BFF",name: "Tamil"},
    {from:"0C00",to:"0C7F",name: "Telugu"},
    {from:"0C80",to:"0CFF",name: "Kannada"},
    {from:"0D00",to:"0D7F",name: "Malayalam"},
    {from:"0D80",to:"0DFF",name: "Sinhala"},
    {from:"0E00",to:"0E7F",name: "Thai"},
    {from:"0E80",to:"0EFF",name: "Lao"},
    {from:"0F00",to:"0FFF",name: "Tibetan"},
    {from:"1000",to:"109F",name: "Myanmar"},
    {from:"10A0",to:"10FF",name: "Georgian"},
    {from:"1100",to:"11FF",name: "Hangul Jamo"},
    {from:"1200",to:"137F",name: "Ethiopic"},
    {from:"1380",to:"139F",name: "Ethiopic Supplement"},
    {from:"13A0",to:"13FF",name: "Cherokee"},
    {from:"1400",to:"167F",name: "Unified Canadian Aboriginal Syllabics"},
    {from:"1680",to:"169F",name: "Ogham"},
    {from:"16A0",to:"16FF",name: "Runic"},
    {from:"1700",to:"171F",name: "Tagalog"},
    {from:"1720",to:"173F",name: "Hanunoo"},
    {from:"1740",to:"175F",name: "Buhid"},
    {from:"1760",to:"177F",name: "Tagbanwa"},
    {from:"1780",to:"17FF",name: "Khmer"},
    {from:"1800",to:"18AF",name: "Mongolian"},
    {from:"18B0",to:"18FF",name: "Unified Canadian Aboriginal Syllabics Extended"},
    {from:"1900",to:"194F",name: "Limbu"},
    {from:"1950",to:"197F",name: "Tai Le"},
    {from:"1980",to:"19DF",name: "New Tai Lue"},
    {from:"19E0",to:"19FF",name: "Khmer Symbols"},
    {from:"1A00",to:"1A1F",name: "Buginese"},
    {from:"1A20",to:"1AAF",name: "Tai Tham"},
    {from:"1AB0",to:"1AFF",name: "Combining Diacritical Marks Extended"},
    {from:"1B00",to:"1B7F",name: "Balinese"},
    {from:"1B80",to:"1BBF",name: "Sundanese"},
    {from:"1BC0",to:"1BFF",name: "Batak"},
    {from:"1C00",to:"1C4F",name: "Lepcha"},
    {from:"1C50",to:"1C7F",name: "Ol Chiki"},
    {from:"1C80",to:"1C8F",name: "Cyrillic Extended-C"},
    {from:"1C90",to:"1CBF",name: "Georgian Extended"},
    {from:"1CC0",to:"1CCF",name: "Sundanese Supplement"},
    {from:"1CD0",to:"1CFF",name: "Vedic Extensions"},
    {from:"1D00",to:"1D7F",name: "Phonetic Extensions"},
    {from:"1D80",to:"1DBF",name: "Phonetic Extensions Supplement"},
    {from:"1DC0",to:"1DFF",name: "Combining Diacritical Marks Supplement"},
    {from:"1E00",to:"1EFF",name: "Latin Extended Additional"},
    {from:"1F00",to:"1FFF",name: "Greek Extended"},
    {from:"2000",to:"206F",name: "General Punctuation"},
    {from:"2070",to:"209F",name: "Superscripts and Subscripts"},
    {from:"20A0",to:"20CF",name: "Currency Symbols"},
    {from:"20D0",to:"20FF",name: "Combining Diacritical Marks for Symbols"},
    {from:"2100",to:"214F",name: "Letterlike Symbols"},
    {from:"2150",to:"218F",name: "Number Forms"},
    {from:"2190",to:"21FF",name: "Arrows"},
    {from:"2200",to:"22FF",name: "Mathematical Operators"},
    {from:"2300",to:"23FF",name: "Miscellaneous Technical"},
    {from:"2400",to:"243F",name: "Control Pictures"},
    {from:"2440",to:"245F",name: "Optical Character Recognition"},
    {from:"2460",to:"24FF",name: "Enclosed Alphanumerics"},
    {from:"2500",to:"257F",name: "Box Drawing"},
    {from:"2580",to:"259F",name: "Block Elements"},
    {from:"25A0",to:"25FF",name: "Geometric Shapes"},
    {from:"2600",to:"26FF",name: "Miscellaneous Symbols"},
    {from:"2700",to:"27BF",name: "Dingbats"},
    {from:"27C0",to:"27EF",name: "Miscellaneous Mathematical Symbols-A"},
    {from:"27F0",to:"27FF",name: "Supplemental Arrows-A"},
    {from:"2800",to:"28FF",name: "Braille Patterns"},
    {from:"2900",to:"297F",name: "Supplemental Arrows-B"},
    {from:"2980",to:"29FF",name: "Miscellaneous Mathematical Symbols-B"},
    {from:"2A00",to:"2AFF",name: "Supplemental Mathematical Operators"},
    {from:"2B00",to:"2BFF",name: "Miscellaneous Symbols and Arrows"},
    {from:"2C00",to:"2C5F",name: "Glagolitic"},
    {from:"2C60",to:"2C7F",name: "Latin Extended-C"},
    {from:"2C80",to:"2CFF",name: "Coptic"},
    {from:"2D00",to:"2D2F",name: "Georgian Supplement"},
    {from:"2D30",to:"2D7F",name: "Tifinagh"},
    {from:"2D80",to:"2DDF",name: "Ethiopic Extended"},
    {from:"2DE0",to:"2DFF",name: "Cyrillic Extended-A"},
    {from:"2E00",to:"2E7F",name: "Supplemental Punctuation"},
    {from:"2E80",to:"2EFF",name: "CJK Radicals Supplement"},
    {from:"2F00",to:"2FDF",name: "Kangxi Radicals"},
    {from:"2FF0",to:"2FFF",name: "Ideographic Description Characters"},
    {from:"3000",to:"303F",name: "CJK Symbols and Punctuation"},
    {from:"3040",to:"309F",name: "Hiragana"},
    {from:"30A0",to:"30FF",name: "Katakana"},
    {from:"3100",to:"312F",name: "Bopomofo"},
    {from:"3130",to:"318F",name: "Hangul Compatibility Jamo"},
    {from:"3190",to:"319F",name: "Kanbun"},
    {from:"31A0",to:"31BF",name: "Bopomofo Extended"},
    {from:"31C0",to:"31EF",name: "CJK Strokes"},
    {from:"31F0",to:"31FF",name: "Katakana Phonetic Extensions"},
    {from:"3200",to:"32FF",name: "Enclosed CJK Letters and Months"},
    {from:"3300",to:"33FF",name: "CJK Compatibility"},
    {from:"3400",to:"4DBF",name: "CJK Unified Ideographs Extension A"},
    {from:"4DC0",to:"4DFF",name: "Yijing Hexagram Symbols"},
    {from:"4E00",to:"9FFF",name: "CJK Unified Ideographs"},
    {from:"A000",to:"A48F",name: "Yi Syllables"},
    {from:"A490",to:"A4CF",name: "Yi Radicals"},
    {from:"A4D0",to:"A4FF",name: "Lisu"},
    {from:"A500",to:"A63F",name: "Vai"},
    {from:"A640",to:"A69F",name: "Cyrillic Extended-B"},
    {from:"A6A0",to:"A6FF",name: "Bamum"},
    {from:"A700",to:"A71F",name: "Modifier Tone Letters"},
    {from:"A720",to:"A7FF",name: "Latin Extended-D"},
    {from:"A800",to:"A82F",name: "Syloti Nagri"},
    {from:"A830",to:"A83F",name: "Common Indic Number Forms"},
    {from:"A840",to:"A87F",name: "Phags-pa"},
    {from:"A880",to:"A8DF",name: "Saurashtra"},
    {from:"A8E0",to:"A8FF",name: "Devanagari Extended"},
    {from:"A900",to:"A92F",name: "Kayah Li"},
    {from:"A930",to:"A95F",name: "Rejang"},
    {from:"A960",to:"A97F",name: "Hangul Jamo Extended-A"},
    {from:"A980",to:"A9DF",name: "Javanese"},
    {from:"A9E0",to:"A9FF",name: "Myanmar Extended-B"},
    {from:"AA00",to:"AA5F",name: "Cham"},
    {from:"AA60",to:"AA7F",name: "Myanmar Extended-A"},
    {from:"AA80",to:"AADF",name: "Tai Viet"},
    {from:"AAE0",to:"AAFF",name: "Meetei Mayek Extensions"},
    {from:"AB00",to:"AB2F",name: "Ethiopic Extended-A"},
    {from:"AB30",to:"AB6F",name: "Latin Extended-E"},
    {from:"AB70",to:"ABBF",name: "Cherokee Supplement"},
    {from:"ABC0",to:"ABFF",name: "Meetei Mayek"},
    {from:"AC00",to:"D7AF",name: "Hangul Syllables"},
    {from:"D7B0",to:"D7FF",name: "Hangul Jamo Extended-B"},
    {from:"D800",to:"DB7F",name: "High Surrogates"},
    {from:"DB80",to:"DBFF",name: "High Private Use Surrogates"},
    {from:"DC00",to:"DFFF",name: "Low Surrogates"},
    {from:"E000",to:"F8FF",name: "Private Use Area"},
    {from:"F900",to:"FAFF",name: "CJK Compatibility Ideographs"},
    {from:"FB00",to:"FB4F",name: "Alphabetic Presentation Forms"},
    {from:"FB50",to:"FDFF",name: "Arabic Presentation Forms-A"},
    {from:"FE00",to:"FE0F",name: "Variation Selectors"},
    {from:"FE10",to:"FE1F",name: "Vertical Forms"},
    {from:"FE20",to:"FE2F",name: "Combining Half Marks"},
    {from:"FE30",to:"FE4F",name: "CJK Compatibility Forms"},
    {from:"FE50",to:"FE6F",name: "Small Form Variants"},
    {from:"FE70",to:"FEFF",name: "Arabic Presentation Forms-B"},
    {from:"FF00",to:"FFEF",name: "Halfwidth and Fullwidth Forms"},
    {from:"FFF0",to:"FFFF",name: "Specials"},
  ]
  selectSymbolsGroup = new FormControl(this.selectOptions[0].from+'|'+this.selectOptions[0].to);
  selectedChar

  constructor(
    private dialogRef: MatDialogRef<InsertSpecialSymbolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  tableContent:string[][]
  contentFlat:string[]
  showSelectedSymbols(){
    this.selectedChar = undefined
    let val = this.selectSymbolsGroup.value.split('|');
    let from = hexToDecimal(val[0]);
    let to = hexToDecimal(val[1]);
    let rowItemsLength = 10;

    let chars = []
    let charsFlat = []
    let counter = 0;
    let rowsCount = 0
    chars[rowsCount] = []
    for(let i = from;i<to+1;i++){
      let str = String.fromCharCode(i);
      chars[rowsCount][counter] = str;
      charsFlat.push(str)
      if(counter == 9){
        counter = 0;
        rowsCount++;
        chars[rowsCount] = [];
      }else{
        counter++;
      }
    }
    this.tableContent = chars
    this.contentFlat = charsFlat
  }
  selectChar(element:any,str){
    let allEls = Array.from(document.getElementsByClassName('char-select'));
    allEls.forEach((el)=>{
      el.className = el.className.replace('selected','');
    })
    element.className = element.className+' selected';
    this.selectedChar = str
    //
  }

  ngAfterViewInit(): void {
    this.showSelectedSymbols();
    this.selectSymbolsGroup.valueChanges.subscribe(()=>{
      this.showSelectedSymbols()
    })
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(data: any) {
    this.dialogRef.close(this.selectedChar)
  }


}
