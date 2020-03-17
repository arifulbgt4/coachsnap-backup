const formRules = {
  email: {
    validate: [
      {
        trigger: 'onBlur',
        rules: [
          { required: true, message: 'Please enter email!' },
          {
            type: 'email',
            message: 'Please enter a valid E-mail!',
          },
        ],
      },
    ],
  },
  password: {
    validate: [
      {
        trigger: 'onBlur',
        rules: [
          {
            required: true,
            message: 'Please enter Password!',
          },
          {
            min: 6,
            message: 'Password must be minimum 6 characters',
          },
        ],
      },
    ],
  },
  name: {
    validate: [
      {
        trigger: 'onBlur',
        rules: [
          {
            required: true,
            message: 'Please enter name!',
            whitespace: true,
          },
        ],
      },
    ],
  },
  username: {
    validate: [
      {
        trigger: 'onBlur',
        rules: [
          {
            required: true,
            message: 'Please input your username!',
            pattern: /^[a-zA-Z0-9]+([a-zA-Z0-9](_|-| )[a-zA-Z0-9])*[a-zA-Z0-9]+$/,
          },
        ],
      },
    ],
  },
};

export default formRules;
