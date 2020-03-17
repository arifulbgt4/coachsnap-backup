const formatError = error => {
  // Graphql error is starts with  "GraphQL error: actual error".
  // Network error is starts with  "Network error: actual error".
  // So We need to delete that part and take the actual message
  const message = error.message.split(': ')[1];
  const contactAdmin = `Please contact with support team.`;
  // Send readable error for mail sent error.
  if (message.includes(process.env.MAIL_HOST))
    return `Sending mail failed. ${contactAdmin}`;
  if (message.includes('Failed to fetch'))
    return `Server is down. ${contactAdmin}`;
  return message;
};

export default formatError;
