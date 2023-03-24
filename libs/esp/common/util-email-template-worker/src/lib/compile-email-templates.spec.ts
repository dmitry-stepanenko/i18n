import {
  assertAllRequiredFieldsAreProvided,
  compileEmailTemplates,
} from './compile-email-templates';

describe('Email template compilation', () => {
  describe('assertAllRequiredFieldsAreProvided', () => {
    it('should throw an error when some field is missing', () => {
      // Arrange & act & assert
      expect(() =>
        assertAllRequiredFieldsAreProvided(
          [
            'Customer',
            'Project.Approver.Name',
            'Something.Really.Cool.But.Missing',
          ],
          {
            Customer: 'Andy',
            Project: {
              Approver: {
                Name: 'Handlebars',
              },
            },
            Something: {
              Really: {
                Cool: {
                  But: {
                    NamedDifferently: 'Really?',
                  },
                },
              },
            },
          }
        )
      ).toThrowError(/not all fields are provided/);
    });
  });

  describe('compileEmailTemplates', () => {
    it('should compile an email template', () => {
      // Arrange & act
      const input = {
        subject: 'Hello, this is {{ Personal.Note}}. Thank you {{User.Name }}',
      };
      const context = {
        Personal: {
          Note: 'Artur',
        },
        User: {
          Name: 'Leigh',
        },
      };
      const { subject } = compileEmailTemplates(input, context);
      // Assert
      expect(subject).toEqual('Hello, this is Artur. Thank you Leigh');
    });
  });
});
