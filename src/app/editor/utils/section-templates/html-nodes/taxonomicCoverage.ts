export const taxonomicCoverageTemplate = `<h2 contenteditable="false">Taxonomic coverage</h2>
<form-field  class="set-align-left" formControlName="prosemirror-editor">
</form-field >
<form-field  class="set-align-left" formControlName="description">
</form-field >
<div class="tableWrapper">
	<table style="min-width: 50px;" formArrayName="taxonomicCoverage">
		<thead>
			<tr>
				<td>
					<p contenteditable="false">
						<b>Rank</b>
					</p>
				</td>
				<td>
					<p contenteditable="false">
						<b>Scientific Name</b>
					</p>
				</td>
				<td>
					<p contenteditable="false"  commentable="true">
						<b>Common Name</b>
					</p>
				</td>
			</tr>
		</thead>
		<tbody>
			<tr *ngFor="let control of formGroup.controls.taxonomicCoverage.controls;let i=index" formGroupName="{{i}}">
				<td>
					<form-field formControlName="rank" contenteditable="false"  commentable="true">
					</form-field>
				</td>
				<td>
					<form-field formControlName="scientificName" menuType="fullMenu" commentable="true">
					</form-field>
				</td>
				<td>
					<form-field formControlName="commonName" >
					</form-field>
				</td>
			</tr>
		</tbody>
	</table>
</div>`;