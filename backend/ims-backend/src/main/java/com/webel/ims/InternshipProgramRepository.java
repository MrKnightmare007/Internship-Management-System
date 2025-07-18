package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InternshipProgramRepository extends JpaRepository<InternshipProgram, Integer> {
}
