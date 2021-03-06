
exports.up = function(knex) {
 return knex.schema.createTable('purchases' ,table => {
    table.string('id').primary().unique().collate('utf8_unicode_ci');
    table.string('payment_id').notNullable();
    table.string('items').notNullable();
    table.string('account_name').notNullable();
    table.string('email').notNullable();
    table.string('status').notNullable();
    table.string('payment_type').notNullable();
    table.string('createdAt').notNullable();
    table.string('approvedAt').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('purchases')
};
