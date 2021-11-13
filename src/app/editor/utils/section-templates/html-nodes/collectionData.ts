export const collectionDataTemplate = `<h2 contenteditable="false">Collection Data</h2>
<form-field contenteditable="false">
	<b>Collection Name:</b>
</form-field>
<form-field style="padding-left:8px" formControlName="collectionName">
</form-field>

<form-field contenteditable="false">
	<b>Collection identifier:</b>
</form-field>
<form-field style="padding-left:8px" formControlName="collectionIdentifier" menuType="fullMenu" commentable="false">
</form-field>

<form-field contenteditable="false">
	<b>Parent collection identifier:</b>
</form-field>
<form-field style="padding-left:8px" formControlName="parentCollectionIdentifier">
</form-field>

<form-field contenteditable="false">
	<b>Specimen preservation method:</b>
</form-field>
<form-field style="padding-left:8px" formControlName="specimenPreservationMethod">
</form-field>

<form-field contenteditable="false">
	<b>Curatorial unit:</b>
</form-field>
<form-field style="padding-left:8px" formControlName="curatorialUnit">
</form-field>`