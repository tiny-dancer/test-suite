'use strict';

import React from 'react';
import {
  AppRegistry,
  Image,
  Linking,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as Exponent from 'exponent';
import jasmineModule from 'jasmine-core/lib/jasmine-core/jasmine';
import Immutable from 'immutable';


// List of all modules for tests. Each file path must be statically present for
// the packager to pick them all up.
const testModules = [
  require('./Tests/Basic1'),
  require('./Tests/Basic2'),

  require('./Tests/Asset'),
  require('./Tests/Constants'),
  require('./Tests/Contacts'),
  require('./Tests/Location'),
];


class App extends React.Component {
  // --- Lifecycle -------------------------------------------------------------

  constructor(props, context) {
    super(props, context);
    this.state = App.initialState;
  }

  componentDidMount() {
    this._runTests(this.props.exp.initialUri);
    Linking.addEventListener('url', ({ url }) => url && this._runTests(url));
  }


  // --- Test running ----------------------------------------------------------

  static initialState = {
    state: Immutable.fromJS({
      suites: [],
      path: ['suites'], // Path to current 'children' List in state
    }),
  }

  async _runTests(uri) {
    // Reset results state
    this.setState(App.initialState);

    const { jasmineEnv, jasmine } = await this._setupJasmine();

    // Load tests, confining to the ones named in the uri
    let modules = testModules;
    if (uri && uri.indexOf(Exponent.Constants.linkingUri) === 0) {
      const deepLink = uri.substring(Exponent.Constants.linkingUri.length);
      const regex = new RegExp(deepLink);
      console.log('regex:', deepLink);
      modules = modules.filter(m => regex.test(m.name));
    }
    modules.forEach(m => m.test(jasmine));

    jasmineEnv.execute();
  }

  async _setupJasmine() {
    // Init
    const jasmineCore = jasmineModule.core(jasmineModule);
    const jasmineEnv = jasmineCore.getEnv();

    // Add our custom reporter too
    jasmineEnv.addReporter(this._jasmineReporter());

    // Get the interface and make it support `async ` by default
    const jasmine = jasmineModule.interface(jasmineCore, jasmineEnv);
    const doneIfy = (fn) => async (done) => {
      try {
        await Promise.resolve(fn());
        done();
      } catch (e) {
        done.fail(e);
      }
    };
    const oldIt = jasmine.it;
    jasmine.it = (desc, fn, t) => oldIt.apply(jasmine, [desc, doneIfy(fn), t]);
    const oldXit = jasmine.xit;
    jasmine.xit = (desc, fn, t) => oldXit.apply(jasmine, [desc, doneIfy(fn), t]);
    const oldFit = jasmine.fit;
    jasmine.fit = (desc, fn, t) => oldFit.apply(jasmine, [desc, doneIfy(fn), t]);

    return {
      jasmineCore,
      jasmineEnv,
      jasmine,
    };
  }

  // A jasmine reporter that writes results to this.state
  _jasmineReporter(jasmineEnv) {
    const app = this;
    return {
      suiteStarted(jasmineResult) {
        app.setState(({ state }) => ({
          state: state.updateIn(
            state.get('path'),
            children => children.push(Immutable.fromJS({
              result: jasmineResult,
              children: [],
              specs: [],
            })),
          ).update(
            'path',
            path => path.push(
              state.getIn(path).size,
              'children',
            ),
          ),
        }));
      },

      suiteDone(jasmineResult) {
        app.setState(({ state }) => ({
          state: state.updateIn(
            state.get('path').pop().pop(),
            children => children.update(
              children.size - 1,
              child => child.set(
                'result',
                child.get('result'),
              ),
            ),
          ).update(
            'path',
            path => path.pop().pop(),
          ),
        }));
      },

      specStarted(jasmineResult) {
        app.setState(({ state }) => ({
          state: state.updateIn(
            state.get('path').pop().pop(),
            children => children.update(
              children.size - 1,
              child => child.update(
                'specs',
                specs => specs.push(Immutable.fromJS(jasmineResult)),
              ),
            ),
          ),
        }));
      },

      specDone(jasmineResult) {
        app.setState(({ state }) => ({
          state: state.updateIn(
            state.get('path').pop().pop(),
            children => children.update(
              children.size - 1,
              child => child.update(
                'specs',
                specs => specs.set(
                  specs.size - 1,
                  Immutable.fromJS(jasmineResult),
                ),
              ),
            ),
          ),
        }));
      },
    };
  }


  // --- Rendering -------------------------------------------------------------

  _renderSpecResult = (r) => {
    return (
      <View
        key={r.get('id')}
        style={{ paddingLeft: 10,
                 marginVertical: 3,
                 borderColor: r.get('failedExpectations').size > 0 ? '#f00' : '#0f0',
                 borderLeftWidth: 3 }}>
        <Text style={{ fontSize: 18 }}>
          {r.get('description')} ({r.get('status') || 'running'})
        </Text>
        {
          r.get('failedExpectations').map((e, i) => (
            <Text key={i}>
              {e.get('message')}
            </Text>
          ))
        }
      </View>
    );
  }

  _renderSuiteResult = (r) => {
    return (
      <View
        key={r.get('result').get('id')}
        style={{ paddingLeft: 10,
                 borderColor: '#000',
                 borderLeftWidth: 3 }}>
        <Text style={{ fontSize: 20 }}>
          {r.get('result').get('description')}
        </Text>
        {r.get('specs').map(this._renderSpecResult)}
        {r.get('children').map(this._renderSuiteResult)}
      </View>
    );
  }

  render() {
    return (
      <View
        style={{ flex: 1,
                 marginTop: Exponent.Constants.statusBarHeight || 18,
                 alignItems: 'stretch',
                 justifyContent: 'center' }}>
        <View
          style={{ height: 30,
                   padding: 10,
                   flexDirection: 'row',
                   alignItems: 'center',
                   justifyContent: 'flex-start' }}>
          <Image
            source={require('./Assets/exponent-icon.png')}
            style={{ width: 29, height: 24 }}
          />
        </View>
        <ScrollView style={{ flex: 1, margin: 5 }}>
          {this.state.state.get('suites').map(this._renderSuiteResult)}
        </ScrollView>
      </View>
    );
  }
}

AppRegistry.registerComponent('main', () => App);
