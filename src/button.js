/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// i know this is all horribly terrible. sorry.

/*class*/ function Radios(props) {
    var self = this;

    self.Init = function() {
        this.buttons = aorb(props?.buttons, []);
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
        self.radii = aorb(props.radii, sx1(10));
        self.margin = aorb(props.margin, {x:0, y:0});
        self.rect = { x: self.x, y: self.y, width: self.width, height: self.height };
        self.title = props.title;
        self.align = aorb(props.align, "center"); // but does not affect checkboxes! :-\
        self.color = props.color;
        self.font_size = props.font_size;
        self.click_fn = aorb(
            props.click_fn,
            // not really an error, but maybe helpful when debugging?
            () => { console.log(`no click_fn registered on '${self.title}'`); }
        );
        self.step_fn = aorb(props.step_fn, () => {});
        self.is_checkbox = props.is_checkbox;
        self.is_checked = aorb(props.is_checked, false);
        self.has_focus = aorb(props.has_focus, false);
        self.wants_focus = false;
    };

    self.Step = function() {
        self.step_fn(self);
    };

    self.Click = function() {
        self.click_fn(self);
    };

    self.ProcessTarget = function(target) {
        return target.isDown() ?
            isPointInRect(target.position, self.rect, self.margin) :
            false;
    };

    self.Focus = function() {
        self.has_focus = true;
        self.wants_focus = false;
    }
    self.Defocus = function() {
        self.has_focus = false;
    };
    
    self.UpdateStyle = function() {
        var color = self.color;
        if (isU(self.color)) {
            if (self.has_focus) {
                color = RandomForColor(cyanSpec);
            }
            else {
                color = RandomForColor(greySpec)
            }
        }
        gCx.strokeStyle = gCx.fillStyle = color;
    };

    self.Draw = function() {
        Cxdo(() => {
            gCx.beginPath();
            gCx.RoundRect(self.x, self.y, self.width, self.height, self.radii);
            gCx.fillStyle = backgroundColorStr;
            gCx.fill();

            gCx.beginPath();
            gCx.RoundRect(self.x, self.y, self.width, self.height, self.radii);
            gCx.lineWidth = sx1( self.has_focus ? 4 : 2 );
            self.UpdateStyle();
            gCx.stroke();

            var cx = self.x+self.width*0.5;
            var lx = self.x+self.width*0.1;
            var rx = self.x+self.width*0.9;
            // bounty: come up with a perfect heursitic for this for all button, text, and screen sizes.
            var ty = self.y + (self.height * 0.74);

            var c = (self.is_checkbox && self.is_checked) ? "c" : (self.is_checkbox ? " " : undefined);
            if (exists(c)) {
                // checkboxes are always left aligned so they don't look too ugly.
                DrawText(c, "left", lx, self.y+self.height*0.75, self.font_size, false);
                DrawText(self.title, "left", lx+self.width*0.1, ty, self.font_size, false);
            }
            else {
                var x = cx;
                if (self.align == "left") { x = lx; }
                if (self.align == "right") { x = rx; }
                DrawText(self.title, self.align, x, ty, self.font_size, false);
            }

            if (gDebug) {
                gCx.strokeStyle = "red";
                gCx.strokeRect(self.x, self.y, self.width, self.height);
                gCx.strokeRect(self.x-self.margin.x, self.y-self.margin.y, self.width+self.margin.x*2, self.height+self.margin.y*2);
            }
        });
    };

    self.Init();
}
