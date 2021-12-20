export const taxonomicCoverageTemplate = `
<h2 contenteditableNode="false">Taxonomic coverage</h2>
<form-field  class="set-align-left" formControlName="description" commentable="false">
</form-field >
<div class="tableWrapper">
	<table style="min-width: 50px;" formArrayName="taxonomicCoverage" contenteditableNode="false" >
		<thead  contenteditableNode="false" >
			<tr contenteditableNode="false" >
				<td>
					<p contenteditableNode="false">
						<b>Rank</b>
					</p>
				</td>
				<td>
					<p contenteditableNode="false">
						<b>Scientific Name</b>
					</p>
				</td>
				<td>
					<p contenteditableNode="false"  commentable="false">
						<b>Common Name</b>
					</p>
				</td>
			</tr>
		</thead>
		<tbody  contenteditableNode="false" >
			<tr *ngFor="let control of formGroup.controls.taxonomicCoverage.controls;let i=index" formGroupName="{{i}}"  contenteditableNode="false" >
				<td contenteditableNode="false">
					<form-field formControlName="rank" contenteditableNode="false"  commentable="false">
					</form-field>
				</td>
				<td contenteditableNode="false">
					<form-field formControlName="scientificName" menuType="fullMenu">
					</form-field>
				</td>
				<td contenteditableNode="false" >
					<form-field formControlName="commonName" >
					</form-field>
				</td>
			</tr>
		</tbody>
	</table>
</div>`;