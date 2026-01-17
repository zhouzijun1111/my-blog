module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  rules: {
    'selector-class-pattern': '^[a-z][a-z0-9-]*$',
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['deep', 'global'] }
    ]
  }
}
