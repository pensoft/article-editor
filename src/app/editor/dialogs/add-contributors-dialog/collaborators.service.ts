import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Injectable({
  providedIn: 'root'
})
export class CollaboratorsService {

  affiliationsSymbolMapping = ["‡", "§", "|", "¶", "#", "¤", "«", "»", "˄", "˅", "¦", "ˀ", "ˁ", "₵", "ℓ", "₰", "₱", "₳", "₴", "₣", "₮", "₦", "₭", "₲", "‽", "₩", "₸"]

  constructor(
    private serviceShare:ServiceShare,
  ) {
    this.serviceShare.shareSelf('CollaboratorsService',this)
  }

/*   getCollaboratorsAffiliations(){
    collaborators
  } */
}
