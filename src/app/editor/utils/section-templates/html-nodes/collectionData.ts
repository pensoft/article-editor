export const collectionDataTemplate = `<h2 contenteditable="false">Collection Data</h2>
<inline-text contenteditable="false">
	<b>Collection Name:</b>
</inline-text>
<inline-text style="padding-left:8px" formControlName="collectionName">
</inline-text>
<br>
	<inline-text contenteditable="false">
		<b>Collection identifier:</b>
	</inline-text>
	<inline-text style="padding-left:8px" formControlName="collectionIdentifier" menuType="fullMenuWithLog" commentable="true">
	</inline-text>
	<br>
		<inline-text contenteditable="false">
			<b>Parent collection identifier:</b>
		</inline-text>
		<inline-text style="padding-left:8px" formControlName="parentCollectionIdentifier">
		</inline-text>
		<br>
			<inline-text contenteditable="false">
				<b>Specimen preservation method:</b>
			</inline-text>
			<inline-text style="padding-left:8px" formControlName="specimenPreservationMethod">
			</inline-text>
			<br>
				<inline-text contenteditable="false">
					<b>Curatorial unit:</b>
				</inline-text>
				<inline-text style="padding-left:8px" formControlName="curatorialUnit">
				</inline-text>`