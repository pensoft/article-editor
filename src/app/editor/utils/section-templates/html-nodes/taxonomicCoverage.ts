export const taxonomicCoverageTemplate = `<h2 contenteditable="false">Taxonomic coverage</h2>
<p class="set-align-left" formControlName="description">
</p>
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
					<p class="set-align-left" formControlName="rank" contenteditable="false"  commentable="true">
					</p>
				</td>
				<td>
					<p class="set-align-left " formControlName="scientificName" menuType="fullMenuWithLog" commentable="true">
					</p>
				</td>
				<td>
					<p class="set-align-left " formControlName="commonName">
					</p>
				</td>
			</tr>
		</tbody>
	</table>
</div>`;