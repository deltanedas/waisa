/*
	Copyright (c) DeltaNedas 2020

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

(() => {

const ui = require("ui-lib/library");

// Table and Entity
var target = null, lastTarget = null;

const updateTarget = (enemy) => {
	target.clear();
	if (!enemy) return;

	const block = enemy instanceof TileEntity ? enemy.block : null;
	const unit = enemy instanceof BaseUnit ? enemy.type : null;
	const icon = block ? block.icon(Cicon.full) : enemy.iconRegion;

	/* The WAISA bit, what is the thing being shot */
	target.table(cons(info => {
		info.addImage(icon).size(48);
		// Block, Unit, Player names
		info.add("[#" + enemy.team.color + "]" + (block ? block.localizedName :
			unit ? unit.localizedName : enemy.name)).padLeft(5);
	}));
	target.row();

	target.label(prov(() => Math.round(enemy.healthf() * 100) + "% health"));
	target.row();

	if (block) {
		target.add(enemy.tile.x + ", " + enemy.tile.y);
	} else {
		target.label(prov(() => Math.round(enemy.x / Vars.tilesize)
			+ ", " + Math.round(enemy.y / Vars.tilesize)));
	}
};

ui.addTable("bottom", "!enemy", table => {
	target = table;
	table.left();
	table.defaults().left();
	table.background(Tex.buttonTrans);
	table.visible(boolp(() => !!Vars.player.target));
});

Events.on(EventType.Trigger.update, run(() => {
	const target = Vars.player.target;
	if (target != lastTarget) {
		updateTarget(target);
	}
	lastTarget = target;
}));

})();
