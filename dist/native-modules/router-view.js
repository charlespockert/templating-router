var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

function _initDefineProp(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}



import { Container, inject } from 'aurelia-dependency-injection';
import { ViewSlot, ViewLocator, customElement, noView, BehaviorInstruction, bindable, CompositionTransaction, CompositionEngine, ShadowDOM } from 'aurelia-templating';
import { Router } from 'aurelia-router';
import { Origin } from 'aurelia-metadata';
import { DOM } from 'aurelia-pal';

var SwapStrategies = function () {
  function SwapStrategies() {
    
  }

  SwapStrategies.prototype.before = function before(viewSlot, previousView, callback) {
    var promise = Promise.resolve(callback());

    if (previousView !== undefined) {
      return promise.then(function () {
        return viewSlot.remove(previousView, true);
      });
    }

    return promise;
  };

  SwapStrategies.prototype.with = function _with(viewSlot, previousView, callback) {
    var promise = Promise.resolve(callback());

    if (previousView !== undefined) {
      return Promise.all([viewSlot.remove(previousView, true), promise]);
    }

    return promise;
  };

  SwapStrategies.prototype.after = function after(viewSlot, previousView, callback) {
    return Promise.resolve(viewSlot.removeAll(true)).then(callback);
  };

  return SwapStrategies;
}();

var swapStrategies = new SwapStrategies();

export var RouterView = (_dec = customElement('router-view'), _dec2 = inject(DOM.Element, Container, ViewSlot, Router, ViewLocator, CompositionTransaction, CompositionEngine), _dec(_class = noView(_class = _dec2(_class = (_class2 = function () {
  function RouterView(element, container, viewSlot, router, viewLocator, compositionTransaction, compositionEngine) {
    

    _initDefineProp(this, 'swapOrder', _descriptor, this);

    _initDefineProp(this, 'layoutView', _descriptor2, this);

    _initDefineProp(this, 'layoutViewModel', _descriptor3, this);

    _initDefineProp(this, 'layoutModel', _descriptor4, this);

    this.element = element;
    this.container = container;
    this.viewSlot = viewSlot;
    this.router = router;
    this.viewLocator = viewLocator;
    this.compositionTransaction = compositionTransaction;
    this.compositionEngine = compositionEngine;
    this.router.registerViewPort(this, this.element.getAttribute('name'));

    if (!('initialComposition' in compositionTransaction)) {
      compositionTransaction.initialComposition = true;
      this.compositionTransactionNotifier = compositionTransaction.enlist();
    }
  }

  RouterView.prototype.created = function created(owningView) {
    this.owningView = owningView;
  };

  RouterView.prototype.bind = function bind(bindingContext, overrideContext) {
    this.container.viewModel = bindingContext;
    this.overrideContext = overrideContext;
  };

  RouterView.prototype.process = function process(viewPortInstruction, waitToSwap) {
    var _this = this;

    var component = viewPortInstruction.component;
    var childContainer = component.childContainer;
    var viewModel = component.viewModel;
    var viewModelResource = component.viewModelResource;
    var metadata = viewModelResource.metadata;
    var config = component.router.currentInstruction.config;
    var viewPort = config.viewPorts ? config.viewPorts[viewPortInstruction.name] : {};

    var layoutInstruction = {
      viewModel: viewPort.layoutViewModel || config.layoutViewModel || this.layoutViewModel,
      view: viewPort.layoutView || config.layoutView || this.layoutView,
      model: viewPort.layoutModel || config.layoutModel || this.layoutModel,
      router: viewPortInstruction.component.router,
      childContainer: childContainer,
      viewSlot: this.viewSlot
    };

    return Promise.resolve(this.composeLayout(layoutInstruction)).then(function (layoutView) {
      var viewStrategy = _this.viewLocator.getViewStrategy(component.view || viewModel);

      if (viewStrategy) {
        viewStrategy.makeRelativeTo(Origin.get(component.router.container.viewModel.constructor).moduleId);
      }

      return metadata.load(childContainer, viewModelResource.value, null, viewStrategy, true).then(function (viewFactory) {
        if (!_this.compositionTransactionNotifier) {
          _this.compositionTransactionOwnershipToken = _this.compositionTransaction.tryCapture();
        }

        viewPortInstruction.layout = layoutView ? layoutView.view || layoutView : undefined;

        viewPortInstruction.controller = metadata.create(childContainer, BehaviorInstruction.dynamic(_this.element, viewModel, viewFactory));

        if (waitToSwap) {
          return;
        }

        _this.swap(viewPortInstruction);
      });
    });
  };

  RouterView.prototype.composeLayout = function composeLayout(instruction) {
    if (instruction.viewModel || instruction.view) {
      return this.compositionEngine.compose(instruction);
    }

    return undefined;
  };

  RouterView.prototype.swap = function swap(viewPortInstruction) {
    var _this2 = this;

    var work = function work() {
      var previousView = _this2.view;
      var swapStrategy = void 0;
      var layout = viewPortInstruction.layout;
      var viewSlot = layout ? new ViewSlot(layout.firstChild, false) : _this2.viewSlot;

      if (layout) {
        viewSlot.attached();
      }

      swapStrategy = _this2.swapOrder in swapStrategies ? swapStrategies[_this2.swapOrder] : swapStrategies.after;

      swapStrategy(viewSlot, previousView, function () {
        if (layout) {
          ShadowDOM.distributeView(viewPortInstruction.controller.view, layout.slots, viewSlot);
          _this2._notify();
        } else {
          return Promise.resolve(viewSlot.add(viewPortInstruction.controller.view)).then(function () {
            _this2._notify();
          });
        }

        _this2.view = viewPortInstruction.controller.view;
        return Promise.resolve();
      });
    };

    viewPortInstruction.controller.automate(this.overrideContext, this.owningView);

    if (this.compositionTransactionOwnershipToken) {
      return this.compositionTransactionOwnershipToken.waitForCompositionComplete().then(function () {
        _this2.compositionTransactionOwnershipToken = null;
        return work();
      });
    }

    return work();
  };

  RouterView.prototype._notify = function _notify() {
    if (this.compositionTransactionNotifier) {
      this.compositionTransactionNotifier.done();
      this.compositionTransactionNotifier = null;
    }
  };

  return RouterView;
}(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'swapOrder', [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'layoutView', [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'layoutViewModel', [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'layoutModel', [bindable], {
  enumerable: true,
  initializer: null
})), _class2)) || _class) || _class) || _class);