export const collectionDataTemplate = `
<h2 contenteditableNode="false">Collection Data</h2>
<inline-block-container style="display: block;">
	<form-field contenteditableNode="false" style="word-break: keep-all;">
		<p style="margin-bottom: 0px;">
			<b>Collection Name:</b>
		</p>
	</form-field>
	<form-field  formControlName="collectionName">
	</form-field>
</inline-block-container>
<inline-block-container style="display: block;">
	<form-field contenteditableNode="false" style="word-break: keep-all;">
		<p style="margin-bottom: 0px;">
			<b>Collection identifier:</b>
		</p>
	</form-field>
	<form-field formControlName="collectionIdentifier" menuType="fullMenu" commentable="false">
	</form-field>
</inline-block-container>
<inline-block-container>
	<form-field contenteditableNode="false" style="word-break: keep-all;">
		<p style="margin-bottom: 0px;">
			<b>Parent collection identifier:</b>
		</p>
	</form-field>
	<form-field  formControlName="parentCollectionIdentifier">
	</form-field>
</inline-block-container>
<inline-block-container>
	<form-field contenteditableNode="false" style="word-break: keep-all;">
		<p style="margin-bottom: 0px;">
			<b>Specimen preservation method:</b>
		</p>
	</form-field>
	<form-field  formControlName="specimenPreservationMethod">
	</form-field>
</inline-block-container>
<inline-block-container>
	<form-field contenteditableNode="false" style="word-break: keep-all;">
		<p style="margin-bottom: 0px;">
			<b>Curatorial unit:</b>
		</p>
	</form-field>
	<form-field  formControlName="curatorialUnit">
	</form-field>
</inline-block-container>

`