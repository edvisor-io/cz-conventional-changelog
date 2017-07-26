"format cjs";

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var rightPad = require('right-pad');

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function (options) {

  var types = options.types;

  var length = longest(Object.keys(types)).length + 1;
  var choices = map(types, function (type, key) {
    return {
      name: rightPad(key + ':', length) + ' ' + type.description,
      value: key
    };
  });

  var projects = [{
    name: 'Pricing engine and anything related to the eventual calculation of a price.',
    value: 'pricing-engine'
  }, {
    name: 'API v2 and migration to API v2',
    value: 'api-v2'
  }, {
    name: 'Data Warehousing and tracking',
    value: 'data-warehousing-tracking'
  }, {
    name: 'B2C project',
    value: 'b2c-project'
  }, {
    name: 'Other (or if you have no idea)',
    value: ''
  }];

  var subCategories = {
    'pricing-engine': [{
      name: 'Vocational & High-School',
      value: 'vocational-high-school'
    }, {
      name: 'Expanding Pricing Engine',
      value: 'engine-expansion'
    }, {
      name: 'Package Concept',
      value: 'packages'
    }, {
      name: 'Elasticsearch R&D',
      value: 'elasticsearch'
    }, {
      name: 'Uncategorized',
      value: ''
    }],

    'api-v2': [{
      name: 'Legacy Conversion v1 -> v2',
      value: 'legacy-conversion'
    }, {
      name: 'Development of API',
      value: 'v2-development'
    }, {
      name: 'Webhook Support',
      value: 'webhook-support'
    }, {
      name: 'Uncategorized',
      value: ''
    }],

    'data-warehousing-tracking': [{
      name: 'Consolidating Dispersed Data',
      value: 'data-collection'
    }, {
      name: 'Uncategorized',
      value: ''
    }]
  };

  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function(cz, commit) {
      console.log('\nLine 1 will be cropped at 100 characters. All other lines will be wrapped after 100 characters.\n');

      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Select the type of change that you\'re committing:',
          choices: choices
        }, {
          type: 'input',
          name: 'subject',
          message: 'Write a short, imperative tense description of the change:\n'
        }, {
          type: 'input',
          name: 'body',
          message: 'Provide a longer description of the change:\n'
        }, {
          type: 'input',
          name: 'hours',
          message: 'Provide the # of hours spent on this commit (ex: "2" or "2.5"):\n'
        }, {
          type: 'list',
          name: 'project',
          message: 'Select the project this commit should fall into:',
          choices: projects
        }, {
          when: function(response) {
            return  response.project === 'pricing-engine' || 
                    response.project === 'api-v2' || 
                    response.project === 'data-warehousing-tracking'
          },
          type: 'list',
          name: 'problem',
          message: 'Choose a sub-category of the project',
          choices: function(response) {
            return subCategories[response.project]
          }
        }, {
          type: 'input',
          name: 'footer',
          message: 'List any breaking changes or issues closed by this change:\n'
        }
      ]).then(function(answers) {

        var maxLineWidth = 100;

        var wrapOptions = {
          trim: true,
          newline: '\n',
          indent:'',
          width: maxLineWidth
        };

        // Hard limit this line
        var head = (answers.type + ': ' + answers.subject.trim()).slice(0, maxLineWidth);

        // Wrap these lines at 100 characters
        var body = wrap(answers.body, wrapOptions);

        // Add SRED.io code
        var hours = '';
        var project = '';
        var subProject = '';

        if (answers.hours.trim()) {
          hours = '-d ' + answers.hours.trim();
        }

        if (answers.project.trim()) {
          project = '-p ' + answers.project;

          if (answers.problem.trim()) {
            subProject = '-c ' + answers.problem
          }
        }

        var sred = ''

        if (hours || project) {
          sred = 'sred ' + [hours, project, subProject].join(' ')
        }

        var footer = wrap(answers.footer, wrapOptions);

        commit([head, body, footer, sred].join('\n\n'));
      });
    }
  };
};
