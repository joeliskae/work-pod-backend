export const rules = {
  'todo-comment': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Warn when TODO comments are found and show the comment content',
      },
      messages: {
        foundTodo: '{{ comment }}',
      },
      schema: [],
    },
    create(context) {
      return {
        Program() {
          const sourceCode = context.getSourceCode();
          const comments = sourceCode.getAllComments();

          comments.forEach(comment => {
            const value = comment.value.trim();
            if (value.toLowerCase().startsWith('todo')) {
              context.report({
                loc: comment.loc,
                messageId: 'foundTodo',
                data: {
                  comment: value,
                },
              });
            }
          });
        },
      };
    },
  },
};
