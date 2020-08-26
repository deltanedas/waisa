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

const ui = require("ui-lib/library");

var target = null, lastTarget = null;
var display = null;

const updateTarget = enemy => {
	display.clear();
	if (!enemy) return;

	const block = enemy instanceof Building ? enemy.block : null;
	const unit = enemy instanceof Unit ? enemy.type : null;
	const player = unit && enemy.isPlayer() ? enemy.controller : null;
	const icon = block ? block.icon(Cicon.full) : enemy.icon();

	/* The WAISA bit, what is the thing being shot */
	const info = display.table().get();
	info.image(icon).size(48);

	// Block, Unit, Player names
	info.add("[#" + enemy.team.color + "]" + (block ? block.localizedName :
		player ? player.name : unit.localizedName)).padLeft(5);
	display.row();

	display.label(() => Math.round(enemy.healthf() * 100) + "% health");
	display.row();

	if (block) {
		display.add(enemy.tile.x + ", " + enemy.tile.y);
	} else {
		display.label(() => Math.round(enemy.x / Vars.tilesize)
			+ ", " + Math.round(enemy.y / Vars.tilesize));
	}
};

ui.addTable("bottom", "!enemy", table => {
	display = table;
	table.left();
	table.defaults().left();
	table.background(Tex.buttonTrans);
	table.visibility = () => !!target;
});

const check = () => {
	if (target != lastTarget) {
		updateTarget(target);
	}
	lastTarget = target;
};

// If is here, not in the update handler, to cut cpu usage
if (Vars.mobile) {
	Events.run(Trigger.update, () => {
		target = Vars.control.input.target;
		check();
	});
} else {
	ui.click((pos, world) => {
		const found = Units.closestTarget(Vars.player.team,
			world.x, world.y, 8);
		if (found) {
			target = found;
		}
	});

	Events.run(Trigger.update, check);
}
