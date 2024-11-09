package veterinaria.ui;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Bienvenida extends JFrame {

    private JButton btnRegistro;
    private JButton btnSalaEspera;
    private JButton btnServicioBanos;
    private JButton btnRecordatorios;
    private JButton btnServicioClinico;

    // Método main para ejecutar la aplicación
    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new Bienvenida().setVisible(true);
            }
        });
    }

    public Bienvenida() {
        setTitle("Sistema de Gestión Veterinaria");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(null);

        // Botón Registro
        btnRegistro = new JButton("Registro");
        btnRegistro.setBounds(50, 50, 130, 30);
        add(btnRegistro);

        // Botón Sala de Espera
        btnSalaEspera = new JButton("Sala de Espera");
        btnSalaEspera.setBounds(200, 50, 130, 30);
        add(btnSalaEspera);

        // Botón Servicio de Baños
        btnServicioBanos = new JButton("Servicio de Baños");
        btnServicioBanos.setBounds(50, 100, 130, 30);
        add(btnServicioBanos);

        // Botón Recordatorios
        btnRecordatorios = new JButton("Recordatorios");
        btnRecordatorios.setBounds(200, 100, 130, 30);
        add(btnRecordatorios);

        // Botón Servicio Clínico
        btnServicioClinico = new JButton("Servicio Clínico");
        btnServicioClinico.setBounds(50, 150, 130, 30);
        add(btnServicioClinico);

        // Acción del botón Registro
        btnRegistro.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                abrirSeleccionRegistro();
            }
        });

        btnSalaEspera.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                abrirSalaEspera();
            }
        });

        btnServicioBanos.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                abrirServicioBanos();
            }
        });

        btnRecordatorios.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                abrirRecordatorios();
            }
        });

        btnServicioClinico.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                abrirServicioClinico();
            }
        });
    }

    private void abrirSeleccionRegistro() {
        SeleccionRegistro seleccionRegistro = new SeleccionRegistro();
        seleccionRegistro.setVisible(true);
    }

    private void abrirSalaEspera() {
        SalaEspera salaEspera = new SalaEspera();
        salaEspera.setVisible(true);
    }

    private void abrirServicioBanos() {
        ServicioBanos servicioBanos = new ServicioBanos();
        servicioBanos.setVisible(true);
    }

    private void abrirRecordatorios() {
        Recordatorios recordatorios = new Recordatorios();
        recordatorios.setVisible(true);
    }

    private void abrirServicioClinico() {
        ServicioClinico servicioClinico = new ServicioClinico();
        servicioClinico.setVisible(true);
    }
}
