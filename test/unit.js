'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var bitcore = require('..');
var errors = bitcore.errors;
var Unit = bitcore.Unit;

describe('Unit', function() {

  it('can be created from a number and unit', function() {
    expect(function() {
      return new Unit(1.2, 'BZC');
    }).to.not.throw();
  });

  it('can be created from a number and exchange rate', function() {
    expect(function() {
      return new Unit(1.2, 350);
    }).to.not.throw();
  });

  it('no "new" is required for creating an instance', function() {
    expect(function() {
      return Unit(1.2, 'BZC');
    }).to.not.throw();

    expect(function() {
      return Unit(1.2, 350);
    }).to.not.throw();
  });

  it('has property accesors "BZC", "mBZC", "uBZC", "bits", and "satoshis"', function() {
    var unit = new Unit(1.2, 'BZC');
    unit.BZC.should.equal(1.2);
    unit.mBZC.should.equal(1200);
    unit.uBZC.should.equal(1200000);
    unit.bits.should.equal(1200000);
    unit.satoshis.should.equal(120000000);
  });

  it('a string amount is allowed', function() {
    var unit;

    unit = Unit.fromBZC('1.00001');
    unit.BZC.should.equal(1.00001);

    unit = Unit.fromMilis('1.00001');
    unit.mBZC.should.equal(1.00001);

    unit = Unit.fromMillis('1.00001');
    unit.mBZC.should.equal(1.00001);

    unit = Unit.fromBits('100');
    unit.bits.should.equal(100);

    unit = Unit.fromSatoshis('8999');
    unit.satoshis.should.equal(8999);

    unit = Unit.fromFiat('43', 350);
    unit.BZC.should.equal(0.12285714);
  });

  it('should have constructor helpers', function() {
    var unit;

    unit = Unit.fromBZC(1.00001);
    unit.BZC.should.equal(1.00001);

    unit = Unit.fromMilis(1.00001);
    unit.mBZC.should.equal(1.00001);

    unit = Unit.fromBits(100);
    unit.bits.should.equal(100);

    unit = Unit.fromSatoshis(8999);
    unit.satoshis.should.equal(8999);

    unit = Unit.fromFiat(43, 350);
    unit.BZC.should.equal(0.12285714);
  });

  it('converts to satoshis correctly', function() {
    /* jshint maxstatements: 25 */
    var unit;

    unit = Unit.fromBZC(1.3);
    unit.mBZC.should.equal(1300);
    unit.bits.should.equal(1300000);
    unit.satoshis.should.equal(130000000);

    unit = Unit.fromMilis(1.3);
    unit.BZC.should.equal(0.0013);
    unit.bits.should.equal(1300);
    unit.satoshis.should.equal(130000);

    unit = Unit.fromBits(1.3);
    unit.BZC.should.equal(0.0000013);
    unit.mBZC.should.equal(0.0013);
    unit.satoshis.should.equal(130);

    unit = Unit.fromSatoshis(3);
    unit.BZC.should.equal(0.00000003);
    unit.mBZC.should.equal(0.00003);
    unit.bits.should.equal(0.03);
  });

  it('takes into account floating point problems', function() {
    var unit = Unit.fromBZC(0.00000003);
    unit.mBZC.should.equal(0.00003);
    unit.bits.should.equal(0.03);
    unit.satoshis.should.equal(3);
  });

  it('exposes unit codes', function() {
    should.exist(Unit.BZC);
    Unit.BZC.should.equal('BZC');

    should.exist(Unit.mBZC);
    Unit.mBZC.should.equal('mBZC');

    should.exist(Unit.bits);
    Unit.bits.should.equal('bits');

    should.exist(Unit.satoshis);
    Unit.satoshis.should.equal('satoshis');
  });

  it('exposes a method that converts to different units', function() {
    var unit = new Unit(1.3, 'BZC');
    unit.to(Unit.BZC).should.equal(unit.BZC);
    unit.to(Unit.mBZC).should.equal(unit.mBZC);
    unit.to(Unit.bits).should.equal(unit.bits);
    unit.to(Unit.satoshis).should.equal(unit.satoshis);
  });

  it('exposes shorthand conversion methods', function() {
    var unit = new Unit(1.3, 'BZC');
    unit.toBZC().should.equal(unit.BZC);
    unit.toMilis().should.equal(unit.mBZC);
    unit.toMillis().should.equal(unit.mBZC);
    unit.toBits().should.equal(unit.bits);
    unit.toSatoshis().should.equal(unit.satoshis);
  });

  it('can convert to fiat', function() {
    var unit = new Unit(1.3, 350);
    unit.atRate(350).should.equal(1.3);
    unit.to(350).should.equal(1.3);

    unit = Unit.fromBZC(0.0123);
    unit.atRate(10).should.equal(0.12);
  });

  it('toString works as expected', function() {
    var unit = new Unit(1.3, 'BZC');
    should.exist(unit.toString);
    unit.toString().should.be.a('string');
  });

  it('can be imported and exported from/to JSON', function() {
    var json = JSON.stringify({amount:1.3, code:'BZC'});
    var unit = Unit.fromObject(JSON.parse(json));
    JSON.stringify(unit).should.deep.equal(json);
  });

  it('importing from invalid JSON fails quickly', function() {
    expect(function() {
      return Unit.fromJSON('¹');
    }).to.throw();
  });

  it('inspect method displays nicely', function() {
    var unit = new Unit(1.3, 'BZC');
    unit.inspect().should.equal('<Unit: 130000000 satoshis>');
  });

  it('fails when the unit is not recognized', function() {
    expect(function() {
      return new Unit(100, 'USD');
    }).to.throw(errors.Unit.UnknownCode);
    expect(function() {
      return new Unit(100, 'BZC').to('USD');
    }).to.throw(errors.Unit.UnknownCode);
  });

  it('fails when the exchange rate is invalid', function() {
    expect(function() {
      return new Unit(100, -123);
    }).to.throw(errors.Unit.InvalidRate);
    expect(function() {
      return new Unit(100, 'BZC').atRate(-123);
    }).to.throw(errors.Unit.InvalidRate);
  });

});
