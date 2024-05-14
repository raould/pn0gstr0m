function ReuseArray( initialCapacity ) {
    var self = this;
    self.length = 0;
    self.array = Array( initialCapacity );

    self.clear = function() {
	self.length = 0;
    };

    self.read = function( index ) {
	Assert(index < self.length);
	Assert(index < self.array.length);
	return self.array[ index ];
    };

    self.push = function( v ) {
	if (self.length < self.array.length) {
	    self.array[self.length] = v;
	}
	else {
	    self.array.push(v);
	}
	++self.length;
    };

    self.pushAll = function( a ) {
	a.forEach((e) => { self.push(e); });
    };

    self.map = function(mfn) {
	var acc = [];
	for( var i = 0; i < self.length; ++i ) {
	    acc.push(mfn(self.array[i], i));
	}
	return acc;
    };

    self.filter = function(ffn) {
	var acc = [];
	for( var i = 0; i < self.length; ++i ) {
	    var e = self.array[i];
	    if(ffn(e, i)) {
		acc.push(e);
	    }
	}
	return acc;
    };

    self.forEach = function( cb ) {
	for( var i = 0; i < self.length; ++i ) {
	    cb(self.array[i], i, self.array);
	}
    };
}

