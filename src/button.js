/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// i know this is all horribly terrible. sorry.

/*class*/ function Radios(props) {
    var self = this;

    self.Init = function() {
        this.buttons = aub(props?.buttons, []);
    };

    self.AddButton = function(button) {
        this.buttons.push(button);
    };

    self.OnSelect = function(button) {
        button.is_checked = true;
        this.buttons.forEach(b => {
            if (b != button) {
                // they should uncheck themselves.
                Assert(b.is_checkbox, b);
                b.Step();
                Assert(!b.is_checked, b);
            }
        });
    };

    self.Init();
}

/*class*/ function Button(props) {
    var self = this;

    self.Init = function() {
        self.x = props.x;
        self.y = props.y;
        self.width = props.width;
        self.height = props.height;
        self.radii = aub(props.radii, sx1(10));
        self.margin = aub(props.margin, {x:0, y:0});
        self.rect = { x: self.x, y: self.y, width: self.width, height: self.height };
        self.title = props.title;
        // warning: note: todo: anything other than "left" alignment is probably buggy.
        // note: checkboxes override self.align.
        self.align = aub(props.align, "left");
        self.color = props.color;
        self.font_size = props.font_size;
        self.click_fn = aub(
            props.click_fn,
            // not really an error, but maybe helpful when debugging?
            () => { console.log(`no click_fn registered on '${self.title}'`); }
        );
        self.step_fn = aub(props.step_fn, () => {});
        self.is_checkbox = aub(props.is_checkbox, false);
        self.is_checked = aub(props.is_checked, false);
        self.has_focus = aub(props.has_focus, false);
	self.disabled = aub(props.disabled, false);
        self.wants_focus = false;
    };

    self.Step = function() {
        self.step_fn(self);
    };

    self.Click = function() {
        if (!self.disabled) {
	    self.click_fn(self);
	}
    };

    self.ProcessTarget = function(target) {
        const hit = target.isDown() ?
	      isPointInRect(target.position, self.rect, self.margin) :
	      false;
        if (hit) {
	    target.ClearPointer();
        }
	return hit;
    };

    self.Focus = function() {
        if (!self.disabled) {
	    self.has_focus = true;
            self.wants_focus = false;
	}
    };

    self.Defocus = function() {
        self.has_focus = false;
    };
    
    self.UpdateStyle = function() {
        var color = self.color;
        if (isU(self.color)) {
            if (self.has_focus) {
                color = RandomForColor(cyanSpec);
            } else if (self.disabled) {
		color = rgba255s(greyDarkSpec.regular);
	    } else {
                color = RandomForColor(greySpec);
            }
        }
        gCx.strokeStyle = gCx.fillStyle = color;
    };

    self.Draw = function() {
        Cxdo(() => {
            var wx = WX(self.x);
            var wy = WY(self.y);
            gCx.beginPath();
            gCx.RoundRect(wx, wy, self.width, self.height, self.radii);
            gCx.fillStyle = backgroundColorStr;
            gCx.fill();

            gCx.beginPath();
            gCx.RoundRect(wx, wy, self.width, self.height, self.radii);
            gCx.lineWidth = sx1( self.has_focus ? 4 : 2 );
            self.UpdateStyle();
            gCx.stroke();

            var cx = wx+self.width*0.5;
            var lx = wx+self.width*0.1;
            var rx = wx+self.width*0.8;
            // bounty: come up with a perfect heursitic for this for all button, text, and screen sizes.
            var ty = wy + (self.height * 0.74);

            var c = (self.is_checkbox && self.is_checked) ? "c" : (self.is_checkbox ? " " : undefined);

            // warning: note: todo: anything other than "left" alignment is probably buggy.

            var x = cx;
            if (self.align == "left") { x = lx; }
            if (self.align == "right") { x = rx; }

            if (exists(c)) {
                DrawText(c, "left", lx, wy+self.height*0.75, self.font_size);
                DrawText(self.title, self.align, x+self.width*0.1, ty, self.font_size);
            }
            else {
                DrawText(self.title, self.align, x, ty, self.font_size);
            }

            if (gDebug) {
                gCx.strokeStyle = "rgba(255,0,0,0.5)";
                gCx.strokeRect(wx, wy, self.width, self.height);
                gCx.strokeRect(wx-self.margin.x, wy-self.margin.y, self.width+self.margin.x*2, self.height+self.margin.y*2);
            }
        });
    };

    self.Init();
}
