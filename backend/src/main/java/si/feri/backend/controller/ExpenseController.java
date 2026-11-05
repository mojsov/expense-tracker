
package si.feri.backend.controller;

import si.feri.backend.model.Expense;
import si.feri.backend.repository.ExpenseRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    private final ExpenseRepository repository;

    public ExpenseController(ExpenseRepository repository) {
        this.repository = repository;
    }

    // CREATE - dodajanje trosok
    @PostMapping
    public ResponseEntity<Expense> create(
            @RequestBody Expense expense) {
        Expense saved = repository.save(expense);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // READ - vsi troskovi
    @GetMapping
    public List<Expense> getAll() {
        return repository.findAll();
    }

    // READ - en trosok
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // SEARCH - iskanje po opisu
    @GetMapping("/search")
    public List<Expense> searchByDescription(
            @RequestParam String description) {
        return repository.findByDescriptionContainingIgnoreCase(description);
    }

    // FILTER - filtriranje po kategoriji
    @GetMapping("/filter")
    public List<Expense> filterByCategory(
            @RequestParam String category) {
        return repository.findByCategoryIgnoreCase(category);
    }

    // UPDATE - sprememba troska
    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(
            @PathVariable Long id,
            @RequestBody Expense updatedExpense) {

        return repository.findById(id)
                .map(expense -> {
                    expense.setDescription(updatedExpense.getDescription());
                    expense.setAmount(updatedExpense.getAmount());
                    expense.setCategory(updatedExpense.getCategory());
                    expense.setDate(updatedExpense.getDate());
                    expense.setPaymentMethod(updatedExpense.getPaymentMethod());

                    Expense saved = repository.save(expense);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE - brisanje troska
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
