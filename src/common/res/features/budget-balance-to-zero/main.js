/* jshint multistr: true */
/* jscs:disable disallowMultipleLineStrings */

(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.budgetBalaceToZero = new function() {  // jshint ignore:line

      this.budgetView = ynab.YNABSharedLib
        .getBudgetViewModel_AllBudgetMonthsViewModel()._result; // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers

      this.invoke = function() {
        var categories = ynabToolKit.budgetBalaceToZero.getCategories();
        var categoryName = ynabToolKit.budgetBalaceToZero.getInspectorName();

        categories.forEach(function(f) {
          if (f.name === categoryName) {
            ynabToolKit.budgetBalaceToZero.updateInspectorButton(f);
          }
        });
      };

      this.observe = function(changedNodes) {
        if (changedNodes.has('budget-inspector')) {
          ynabToolKit.budgetBalaceToZero.invoke();
        }
      };

      this.getCategories = function() {
        if (ynabToolKit.budgetBalaceToZero === 'undefined') {
          return [];
        }

        var categories = [];
        var masterCategories = [];
        var masterCats = ynabToolKit.budgetBalaceToZero.budgetView
          .categoriesViewModel.masterCategoriesCollection._internalDataArray;

        masterCats.forEach(function(c) {
          // Filter out "special" categories
          if (c.internalName === null) {
            masterCategories.push(c.entityId);
          }
        });

        masterCategories.forEach(function(c) {
          var accounts = ynabToolKit.checkCreditBalances.budgetView
            .categoriesViewModel.subCategoriesCollection
            .findItemsByMasterCategoryId(c);

          Array.prototype.push.apply(categories, accounts);
        });

        return categories;
      };

      this.updateInspectorButton = function(f) {
        if ($('.balance-to-zero').length) {
          return;
        }

        var name = f.name;
        var amount = ynabToolKit.budgetBalaceToZero.getBudgetAmount(f);

        var fhAmount = ynabToolKit.shared
          .formatCurrency(amount, true);
        var fAmount = ynabToolKit.shared
          .formatCurrency(amount, false);
        var button = ' \
        <button class="budget-inspector-button balance-to-zero" \
          onClick="ynabToolKit.checkCreditBalances.updateCreditBalances(\'' +
          name + '\', ' + amount + ')"> \
          Balance to 0.00: \
            <strong class="user-data" title="' + fAmount + '"> \
              <span class="user-data currency zero"> \
              ' + fhAmount + ' \
            </span> \
          </strong> \
        </button>';

        $('.inspector-quick-budget .ember-view').append(button);
      };

      this.getInspectorName = function() {
        return $('.inspector-category-name.user-data').text().trim();
      };

      this.getBudgetAmount = function(f) {
        var currentMonth = moment(ynabToolKit.shared.parseSelectedMonth())
          .format('YYYY-MM');
        var monthlyBudget = ynabToolKit.checkCreditBalances.budgetView
          .monthlySubCategoryBudgetCalculationsCollection
          .findItemByEntityId('mcbc/' + currentMonth + '/' + f.entityId);

        return (monthlyBudget.cashOutflows * -1);
      };

    }();
  } else {
    setTimeout(poll, 250);
  }
})();
