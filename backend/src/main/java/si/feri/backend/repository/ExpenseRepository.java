package si.feri.backend.repository;

import si.feri.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByDescriptionContainingIgnoreCase(String description);

    List<Expense> findByCategoryIgnoreCase(String category);
}


