const hasSpeacialChars = value => {
  return (
    value &&
    value.match(
      // eslint-disable-next-line no-useless-escape
      /[\!\@\#\$\%\^\&\*\)\(\+\=\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-\d+]/g
    )
  );
};

export default hasSpeacialChars;
